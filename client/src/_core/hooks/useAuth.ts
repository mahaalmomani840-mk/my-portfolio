import { trpc } from "@/lib/trpc";

export function useAuth() {
  const me = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 30_000,
  });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.assign("/");
    },
  });

  return {
    user: me.data ?? null,
    loading: me.isLoading,
    logout: () => logoutMutation.mutate(),
  };
}
