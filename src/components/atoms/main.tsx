type MainProps = {
  children: React.ReactNode;
};

export default function Main(props: MainProps) {
  const { children } = props;

  return (
    <main className="flex min-h-screen flex-col justify-between p-24">
      {children}
    </main>
  );
}
