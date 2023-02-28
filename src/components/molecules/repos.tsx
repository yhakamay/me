import { Link } from "@chakra-ui/next-js";
import { Text, VStack } from "@chakra-ui/react";
import useSWR from "swr";

export default function Repos() {
  const { data, error, isLoading } = useSWR(
    "https://api.github.com/users/yhakamay/repos?sort=created&direction=desc",
    fetcher
  );

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading) return <div>Loading repos...</div>;

  return (
    <>
      <VStack align={"start"}>
        {data.map((repo: any) => (
          <>
            <Link href={repo.html_url} key={repo.id}>
              <Text decoration={"underline"}>{repo.name}</Text>
            </Link>
          </>
        ))}
      </VStack>
    </>
  );
}

const fetcher = (url: URL) => fetch(url).then((res) => res.json());
