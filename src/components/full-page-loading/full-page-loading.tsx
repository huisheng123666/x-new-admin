import { FC } from "react";
import styles from "./style.module.scss";

const FullPageLoading: FC = () => {
  return (
    <div className={styles.fullPageLoading}>
      <span className="loader"></span>
    </div>
  );
};

export default FullPageLoading;
