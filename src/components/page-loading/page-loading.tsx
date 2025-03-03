import { FC } from "react";
import styles from "./style.module.scss";

const PageLoading: FC = () => {
  return (
    <div className={styles.pageLoading}>
      <span className="loader"></span>
    </div>
  );
};

export default PageLoading;
