import ConfirmPage from "@/components/ui/Input";

interface Props{
   searchParams: Promise<{
       token?: string;
   }>;
}

export default async function Page({ searchParams }: Props) {
  const {token} = await searchParams;

  return <ConfirmPage token={token} />;
}
