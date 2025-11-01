export interface EscrowDetails {
  shopper: string; // Now this is the agent
  maker: string;
  creator: string;
  treasury: string;
  amount: string;
  milestonesCompleted: number;
  status: string;
  remainingBalance: string;
  hasCreator: boolean;
  escrowId?: string;
}

export interface CreateEscrowForm {
  makerAddress: string;
  treasuryAddress: string;
  creatorAddress: string;
  amount: string;
}

export interface EscrowContextType {
  selectedEscrowId: string | null;
  setSelectedEscrowId: (id: string | null) => void;
  refreshEscrows: () => void;
}