import { useActor } from "@caffeineai/core-infrastructure";
import runtimeEnv from "../../env.json";
import type { backendInterface } from "../backend";
import { createActor } from "../backend";
import { mockBackend } from "../mocks/backend";

function isConfigured(value: string | undefined) {
  return Boolean(value && value !== "undefined" && value !== "null");
}

const hasBackendConfig =
  isConfigured(runtimeEnv.backend_host) &&
  isConfigured(runtimeEnv.backend_canister_id) &&
  isConfigured(runtimeEnv.project_id);

export function useBackendActor() {
  const { actor, isFetching } = useActor(createActor);

  if (!hasBackendConfig) {
    return {
      actor: mockBackend as backendInterface,
      isFetching: false,
      isMockBackend: true,
    };
  }

  return {
    actor: (actor as backendInterface | null) ?? null,
    isFetching,
    isMockBackend: false,
  };
}
