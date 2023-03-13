type MainProps = {
  children: React.ReactNode;
};

import styles from "./main.module.scss";

export default function Main(props: MainProps) {
  const { children } = props;

  return <main className={styles.main}>{children}</main>;
}
