import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { grid } from "./grid";
import { wheel } from "./wheel";

const useStore = create(
  devtools((set, get) => ({
    contractAddress: "0xa25c09e571864ab351bdc3d08181c063469d08bd550ca662e815f78ff8450707",

    wheel: wheel(set, get),
    grid: grid(set, get),

    errors: [],
    setErrors: (errors) => set({ errors: errors }),
  }))
);

export default useStore;
