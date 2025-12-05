import ResetPasswordPage from "../../../../../docs/ui/Restablecer-password"

export default async function page({ searchParams }: { searchParams: Promise <{ token?: string }> } ) {
  const {token} = await searchParams
  return <ResetPasswordPage token={token!} />
}
