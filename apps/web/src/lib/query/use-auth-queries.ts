import { useMutation } from "@tanstack/react-query";

import { getLoginPost, postLogin, postSignup } from "@/lib/api";

export function useLoginMutation() {
  return useMutation({
    mutationFn: (email: string) => postLogin(email),
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: (email: string) => postSignup(email),
  });
}

export function useCallbackLoginMutation() {
  return useMutation({
    mutationFn: (token: string) => getLoginPost(token),
  });
}
