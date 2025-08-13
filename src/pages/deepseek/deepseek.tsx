import {useState, useRef, useEffect} from 'react';
import {Button, Card, Form, Input, Space, Typography} from "antd";
import styles from './deepseek.module.scss';
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import {getStorage, setStorage} from "@/common/utils";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import rehypeRaw from 'rehype-raw'

const { Text } = Typography;


const DeepSeekChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>(getStorage('deepseekMsgs') || [
    {
      role: 'system',
      content: '你好！我是 DeepSeek-Reasoner，专注于逻辑推理和问题解决。我会返回Markdown格式的答案。'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage]
    newMessages.forEach(item => {
      delete item.reasoning_content
    });
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setWaiting(true);

    try {
      controllerRef.current = new AbortController();

      const response = await fetch('/deepseekr1/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "deepseek-reasoner",
          messages: newMessages,
          stream: true,
          max_tokens: 4096
        }),
        signal: controllerRef.current.signal
      });

      setWaiting(false)

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const aiMessage = { role: 'assistant', content: '', reasoning_content: '' };

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const dataStrs = chunk.split('data: ').filter(str => str.trim());

        for (const dataStr of dataStrs) {
          if (dataStr.trim() === '[DONE]') break;

          try {
            const data = JSON.parse(dataStr);
            // console.log('finish_reason:', data.choices[0]?.finish_reason)
            aiMessage.content += data.choices[0]?.delta?.content || '';
            aiMessage.reasoning_content += data.choices[0]?.delta?.reasoning_content || '';

            // 优化渲染性能
            setMessages(prev => {
              const last = prev[prev.length - 1];
              return last?.role === aiMessage.role
                ? [...prev.slice(0, -1), aiMessage]
                : [...prev, aiMessage];
            });
          } catch (err) {
            console.warn('解析错误:', err);
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⚠️ 请求失败: ${err.message}`
        }]);
      }
    } finally {
      setIsLoading(false);
      setWaiting(false)
    }
  };

  const stopGenerating = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setStorage('deepseekMsgs', messages);
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current?.scrollHeight || 0;
      }
    }, 100)
  }, [messages]);

  return (
    <>
      <Card className={styles.deepseek} title="deepseek">
        <div className="msg-wrap" style={{ minHeight: '50vh' }} ref={scrollRef}>
          {messages.slice(1).map((msg, i) => (
            <div key={i} style={{ display: msg.role === 'user' ? 'flex' : 'block', justifyContent: msg.role === 'user' ? 'flex-end' : '', maxWidth: '90%', marginBottom: 20 }}>
              <Text type="secondary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.reasoning_content}
                </ReactMarkdown>
              </Text>

              <div className="msg-content">
                {msg.role === 'user' ? <div className="user-msg">{msg.content}</div> :
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    children={msg.content}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      code(props) {
                        const {children, className, ...rest} = props
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                          <SyntaxHighlighter
                            {...rest as any}
                            PreTag="div"
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  />}
              </div>
            </div>
          ))}
        </div>
        <Form onFinish={sendMessage}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="输入消息..."
            />
            {isLoading ? (
              <Button loading={waiting} onClick={stopGenerating}>停止生成</Button>
            ) : (
              <Button type="primary" htmlType="submit" disabled={!input.trim()}>
                发送
              </Button>
            )}
            <Button onClick={() => setMessages([{
              role: 'system',
              content: '你好！我是 DeepSeek-Reasoner，专注于逻辑推理和问题解决。我会返回Markdown格式的答案。'
            }])}>清空</Button>
          </Space.Compact>
        </Form>
      </Card>
    </>
  );
};

export default DeepSeekChat;
