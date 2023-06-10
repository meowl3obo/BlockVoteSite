import { useRouter } from "next/router";

export default function Test() {
  const router = useRouter();
  return (
    <main>
      <div>id {router.query.id}</div>
    </main>
  );
}
