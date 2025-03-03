import {useUser} from "@/context/user.tsx";
import {useLayoutEffect} from "react";

export function usePermission(watchData: unknown) {
  const { permissionMap } = useUser()

  useLayoutEffect(() => {
    if (permissionMap.current['*:*:*']) {
      return;
    }

    const permissionEles = document.querySelectorAll('[data-perms]') as NodeListOf<HTMLDataElement>

    for (const permission of permissionEles) {
      const perms = permission.dataset.perms
      if (!permissionMap.current[perms!]) {
        permission.parentNode?.removeChild(permission)
      }
    }
  }, [permissionMap, watchData]);
}
