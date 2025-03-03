import {FC, useMemo} from "react";
import styles from "./home.module.scss";
import Icon1 from './icon1@2x.png'
import Icon2 from './icon2@2x.png'
import Icon3 from './icon3@2x.png'
import Icon4 from './icon4@2x.png'
import ReactECharts from 'echarts-for-react';

const mthDataTem = [
  {
    "credit_amount": 10449.99,
    "credit_enterprise_num": 236879,
    "statistics_end_time": "2024-10"
  },
  {
    "credit_amount": 10322.8,
    "credit_enterprise_num": 234270,
    "statistics_end_time": "2024-09"
  },
  {
    "credit_amount": 9957.17,
    "credit_enterprise_num": 228890,
    "statistics_end_time": "2024-08"
  },
  {
    "credit_amount": 8837.32,
    "credit_enterprise_num": 225938,
    "statistics_end_time": "2024-07"
  },
  {
    "credit_amount": 8674.42,
    "credit_enterprise_num": 224676,
    "statistics_end_time": "2024-06"
  },
  {
    "credit_amount": 8166.38,
    "credit_enterprise_num": 209026,
    "statistics_end_time": "2024-05"
  },
  {
    "credit_amount": 7986.18,
    "credit_enterprise_num": 203348,
    "statistics_end_time": "2024-04"
  },
  {
    "credit_amount": 7810.9,
    "credit_enterprise_num": 198092,
    "statistics_end_time": "2024-03"
  },
  {
    "credit_amount": 7494.48,
    "credit_enterprise_num": 192957,
    "statistics_end_time": "2024-02"
  },
  {
    "credit_amount": 7413.3,
    "credit_enterprise_num": 189192,
    "statistics_end_time": "2024-01"
  }
]

const Home: FC = () => {

  const option = useMemo(() => {
    return {
      color: ['#00FFE6', '#2693FF'],
      grid: {
        left: '5%',
        right: '8%'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      legend: {
        top: 20,
        data: ['流量趋势', '月访问量'],
        textStyle: {
          color: '#A1AAB3',
          fontSize: 18
        },
        itemGap: 80
      },
      xAxis: [
        {
          type: 'category',
          data: mthDataTem.map(item => item.statistics_end_time),
          axisPointer: {
            type: 'shadow'
          },
          axisTick: {
            show: false
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            show: false,
          }
        },
        {
          type: 'value',
          splitLine: {
            show: false,
          }
        }
      ],
      animationDurationUpdate: 1000,
      series: [
        {
          name: '流量趋势',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          symbol: 'none',
          areaStyle: {
            origin: 'start',
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: '#00D8C3' // 0% 处的颜色
              }, {
                offset: 1, color: 'rgba(0, 216, 195, 0)' // 100% 处的颜色
              }],
              global: false // 缺省为 false
            }
          },
          data: mthDataTem.map(item => item.credit_amount)
        },
        {
          name: '月访问量',
          type: 'bar',
          yAxisIndex: 1,
          barWidth: 24,
          itemStyle: {
            borderRadius: 6,
            color: {
              type: 'linear',
              x: 0,
              y: 1,
              x2: 0,
              y2: 0,
              colorStops: [{
                offset: 0, color: 'rgba(38, 147, 255, 0.20)' // 0% 处的颜色
              }, {
                offset: 1, color: 'rgba(38, 147, 255, 1)' // 100% 处的颜色
              }],
              global: false // 缺省为 false
            }
          },
          data: mthDataTem.map(item => item.credit_enterprise_num)
        }
      ]
    }
  }, [])

  return (
    <div className={styles.home}>
      <div className="total">
        <div className="item">
          <img src={Icon1} alt=""/>
          <h6>2000</h6>
          <p>用户量</p>
        </div>
        <div className="item">
          <img src={Icon2} alt=""/>
          <h6>20000</h6>
          <p>访问量</p>
        </div>
        <div className="item">
          <img src={Icon3} alt=""/>
          <h6>8000</h6>
          <p>下载量</p>
        </div>
        <div className="item">
          <img src={Icon4} alt=""/>
          <h6>5000</h6>
          <p>使用量</p>
        </div>
      </div>

      <ReactECharts className="hot-line" style={{ height: 469 }} option={option} />

    </div>
  );
};

export default Home;
