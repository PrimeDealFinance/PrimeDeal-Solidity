import { create } from "zustand";
import { ethers } from "ethers";
import ERC20abi from "../app/ERC20"; // TODO: move to common place

interface WalletState {
  isConnect: boolean;
  account: string;
  provider: ethers.BrowserProvider | any;
  signer: ethers.Signer | null;
  network: ethers.Network | null;
  isOpenCommonModal: boolean;
  contentCommonModal: string;
  isOpenModalConnect: boolean;
  positionManagerContractAddress: string;
  USDTContractAddress: string;
  ETHContractAddress: string;
  contractSigner: ethers.Contract | any;
  usdtSigner: ethers.Contract | any;
  positionManagerContractAbi: string;
  USDTContractAbi: string[];
  setIsOpenModalConnect: (isOpen: boolean) => void;
  setIsOpenCommonModal: (isOpen: boolean) => void;
  setContentCommonModal: (content: string) => void;
  setIsConnect: (isConnect: boolean) => void;
  setAccount: (account: string) => void;
  setProvider: (provider: ethers.BrowserProvider | null) => void;
  setSigner: (signer: ethers.Signer | null) => void;
  setNetwork: (network: ethers.Network | null) => void;
  setContractSigner: (signer: ethers.Contract | any) => void;
  setUsdtSigner: (signer: ethers.Contract | any) => void;
  handleIsConnected: () => void;
  handleConnectNotice: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  isConnect: false,
  account: "",
  provider: "",
  signer: null,
  network: null,
  isOpenCommonModal: false,
  contentCommonModal: "Error",
  contractSigner: "",
  usdtSigner: "",
  positionManagerContractAddress: process.env
    .NEXT_PUBLIC_POSITION_MANAGER_ADDRESS_MUMBAI!,
  USDTContractAddress: process.env.NEXT_PUBLIC_USDT_ERC20_ADDRESS_MUMBAI!,
  ETHContractAddress: process.env.NEXT_PUBLIC_ETH_ERC20_ADDRESS_MUMBAI!,
  positionManagerContractAbi: process.env.NEXT_PUBLIC_POSITION_MANAGER_ABI!,
  USDTContractAbi: ERC20abi,
  isOpenModalConnect: false,
  setIsOpenModalConnect: (isOpen) => set({ isOpenModalConnect: isOpen }),
  setIsConnect: (isConnect) => set(() => ({ isConnect })),
  setAccount: (account) => set(() => ({ account })),
  setProvider: (provider) => set(() => ({ provider })),
  setSigner: (signer) => set(() => ({ signer })),
  setNetwork: (network) => set(() => ({ network })),
  setIsOpenCommonModal: (isOpen) => set({ isOpenCommonModal: isOpen }),
  setContentCommonModal: (content) => set({ contentCommonModal: content }),
  setContractSigner: (contract) => set({ contractSigner: contract }),
  setUsdtSigner: (contract) => set({ usdtSigner: contract }),
  handleIsConnected: async () => {
    console.log("handleIsConnected");
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
    } else {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const {
        positionManagerContractAddress,
        USDTContractAddress,
        positionManagerContractAbi,
        USDTContractAbi,
      } = get();

      const contractSigner = new ethers.Contract(
        positionManagerContractAddress,
        positionManagerContractAbi,
        signer
      );

      const usdtSigner = new ethers.Contract(
        USDTContractAddress,
        USDTContractAbi,
        signer
      );

      if (Number(network.chainId) !== 80001) {
        console.log("Wrong network. Need POL");
        // Обновите состояние, используя методы set
        set({
          isOpenCommonModal: true,
          contentCommonModal: "Wrong network. Please connect to Polygon!",
        });
      } else {
        // Обновите все соответствующие состояния
        set({
          account: accounts[0],
          provider,
          signer,
          network,
          isConnect: true,
          isOpenModalConnect: false,
          contractSigner,
          usdtSigner,
        });
      }
    }
  },
  handleConnectNotice: () => {
    set({
      isOpenCommonModal: true,
      contentCommonModal: "Please connect to MetaMask!",
    });
  },
}));
