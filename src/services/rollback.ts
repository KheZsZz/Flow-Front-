import { router } from "expo-router";

const rollback = async () => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(app)/dashboard");
  }
};

export default rollback;
