import instance from "./axios";

// Interface for StartChat response
export interface StartChatResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    state: string;
    userId: string;
    creatorId: string;
    welcomeMessage?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  imageBase64?: string;
  actionType?: string;
}
export interface SendMessageResponse {
  status: boolean;
  message: string;
  data: { chatId: string; state: string; aiResponse: string };
}
export interface StreamChatTokenResponse {
  status: boolean;
  message: string;
  data: { token: string; userId: string; apiKey: string };
}
export interface Chat {
  id: string;
  title: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
  userId: string;
  creatorId: string;
  metadata?: { lastUserInput?: string };
}
export interface ChatMessage {
  id: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  role: "user" | "assistant" | "system";
  chatId: string;
}
export interface GetAllChatsResponse {
  status: boolean;
  message: string;
  data: Chat[];
}
export interface GetChatByIdResponse {
  status: boolean;
  message: string;
  data: Chat & { messages: ChatMessage[] };
}

// ============================
// Auth Interfaces
// ============================
export interface RegisterCreatorRequest {
  email: string;
  password: string;
  fullName: string;
  role: "creator";
}

export interface RegisterCreatorResponse {
  status: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface VerifyCreatorOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyCreatorOTPResponse {
  status: boolean;
  message: string;
  data: {
    walletAddress: string;
    user: {
      id: string;
      createdAt: string;
      updatedAt: string;
      email: string;
      fullName: string;
      verified: boolean;
      userType: string;
      walletAddress: string;
      profileCompleted: boolean;
      identityVerified: boolean;
      brandName?: string;
      brandOrigin?: string;
      brandStory?: string;
      brandLogo?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginResponse {
  status: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      createdAt: string;
      updatedAt: string;
      email: string;
      fullName: string;
      verified: boolean;
      userType: string;
      walletAddress: string;
      profileCompleted: boolean;
      identityVerified: boolean;
      brand?: { userId: string; name: string };
    };
  };
}

export interface CreateBrandDetailsResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    fullName: string;
    verified: boolean;
    userType: string;
    walletAddress: string;
    profileCompleted: boolean;
    identityVerified: boolean;
    brandName: string;
    brandOrigin: string;
    brandStory: string;
    brandLogo: string;
  };
}

// ============================
// Browse Marketplace
// ============================
export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl: string;
  status: "listed" | "draft" | "minted";
  createdAt: string;
  creator: {
    id: string;
    fullName: string;
    profilePicture: string;
  };
  metadata: {
    deliveryWindow: string;
    brandStory: string;
    regionOfDelivery: string;
  };
}

// Response type
export interface BrowseMarketplaceResponse {
  items: MarketplaceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    categories: string[];
    priceRange: { min: number; max: number };
    regions: string[];
  };
}

// Query params type (optional filters)
export interface BrowseMarketplaceParams {
  search?: string;
  category?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest";
  page?: number;
  limit?: number;
}

export interface MintNFTRequest {
  chatId?: string;
  selectedVariation?: string;
  designId?: string;
  paymentTransactionHash: string;
  name: string;
  quantity: number;
}

export interface MintNFTResponse {
  status: boolean;
  message: string;
  data?: any;
}

// ============================
// Upload Design Directly
// ============================
export interface UploadDesignDirectlyRequest {
  image: File; // PNG, JPG, or JPEG, max 10MB
  description: string;
}

export interface UploadDesignDirectlyResponse {
  status: boolean;
  message: string;
  data: {
    designId: string;
    imageUrl: string;
    description: string;
    variants: {
      thumbnail: string;
      medium: string;
      large: string;
      original: string;
    };
    nextStep: string; // "Use the /web3/nft/mint endpoint to mint this design"
  };
}

// ============================
// Applications Interfaces
// ============================
export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  jobBudget: number;
  maker: {
    id: string;
    fullName: string;
    email: string;
    profilePicture: string;
    bio: string;
    skills: string[];
    brandName: string;
    location: string;
  };
  proposedBudget: number;
  estimatedDays: number;
  proposedTimeline: number;
  proposal: string;
  coverLetter: string;
  portfolioUrl: string;
  selectedProjects: {
    id: string;
    title: string;
    images: string[];
    description: string;
    tags: string[];
  }[];
  status: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface MakerProfileResponse {
  applicationId: string;
  applicationStatus: string;
  appliedAt: string;
  maker: {
    id: string;
    fullName: string;
    email: string;
    profilePicture: string;
    bio: string;
    location: string;
    skills: string[];
    brandName: string;
    brandStory: string;
    brandLogo: string;
    yearsOfExperience: number;
  };
  application: {
    proposedAmount: number;
    proposedTimeline: number;
    coverLetter: string;
    portfolioUrl: string;
    portfolioLinks: string[];
    selectedProjects: {
      id: string;
      title: string;
      images: string[];
      description: string;
      tags: string[];
    }[];
  };
  verification: {
    identityVerified: boolean;
    businessCertificate: string;
    businessName: string;
    businessType: string;
  };
  workExperience: {
    employerName: string;
    jobTitle: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    jobDescription: string;
  }[];
  projects: {
    title: string;
    images: string[];
    description: string;
    tags: string[];
  }[];
}

export interface DeclineApplicationResponse {
  id: string;
  jobId: string;
  makerId: string;
  status: string;
  respondedAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    status: string;
  };
  maker: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface AcceptApplicationResponse {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  makerId: string;
  maker: {
    id: string;
    fullName: string;
    email: string;
  };
  acceptedAt: string;
  updatedAt: string;
}

// ============================
// Hedera NFT Listings
// ============================
export interface BatchListNFTsRequest {
  quantity: number;
  price: string;
}

// ============================
// API Class
// ============================

class ApiClass {
  private axios;

  constructor() {
    this.axios = instance;
  }

  private handleError(error, defaultMessage: string): never {
    let message =
      error?.response?.data?.message || error?.message || defaultMessage;

    // Check if the error message (or code) indicates a timeout
    if (
      message?.toLowerCase().includes("timeout") ||
      error?.code === "ECONNABORTED"
    ) {
      message = "Please try again";
    }

    throw new Error(message);
  }

  // =====================
  // Auth Methods
  // =====================
  async registerCreator(data: {
    email: string;
    password: string;
    fullName: string;
    role: "creator";
  }) {
    try {
      const res = await this.axios.post("/auth/register", data);
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to register creator");
    }
  }

  async verifyCreatorOTP(data: { email: string; otp: string }) {
    try {
      const res = await this.axios.post("/auth/verify-otp", data);
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to verify OTP");
    }
  }

  async login(data: { email: string; password: string }) {
    try {
      const res = await this.axios.post("/auth/login", data);
      return res.data;
    } catch (err) {
      this.handleError(err, "Login failed");
    }
  }

  async createBrandDetails(
    brandName: string,
    brandOrigin: string,
    brandStory: string,
    brandLogo: File
  ) {
    try {
      if (!["image/jpeg", "image/jpg"].includes(brandLogo.type)) {
        throw new Error(
          "Only JPG and JPEG formats are accepted for brand logo"
        );
      }

      const formData = new FormData();
      formData.append("brandName", brandName);
      formData.append("brandOrigin", brandOrigin);
      formData.append("brandStory", brandStory);
      formData.append("brandLogo", brandLogo);

      const res = await this.axios.post("/users/brand-details", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to create brand details");
    }
  }

  // =====================
  // Chat Methods
  // =====================
  async startChat() {
    try {
      const res = await this.axios.post("/ai-chat/start");
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to start chat");
    }
  }

  async sendMessage(data: {
    chatId: string;
    content: string;
    imageBase64?: string;
    actionType?: string;
  }) {
    try {
      const res = await this.axios.post("/ai-chat/message", data);
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to send message");
    }
  }

  async getStreamChatToken() {
    try {
      const res = await this.axios.get("/ai-chat/token");
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to fetch Stream Chat token");
    }
  }

  async getAllChats() {
    try {
      const res = await this.axios.get("/ai-chat");
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to fetch chats");
    }
  }

  async getChatById(chatId: string) {
    try {
      const res = await this.axios.get(`/ai-chat/${chatId}`);
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to fetch chat");
    }
  }

  // =====================
  // Creator Methods
  // =====================
  async getCreatorInventory() {
    try {
      const res = await this.axios.get("/creator/inventory");
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to fetch creator inventory");
    }
  }

  async getCreatorInventoryById(designId: string) {
    try {
      const res = await this.axios.get(`/creator/inventory/${designId}`);
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to fetch creator inventory by ID");
    }
  }

  async publishToMarketplace(data: {
    designId: string;
    pricePerOutfit: number;
    quantityAvailable: number;
    deliveryWindow: string;
    brandStory: string;
    regionOfDelivery: string;
  }) {
    try {
      const res = await this.axios.post("/creator/publish-marketplace", data, {
        timeout: 50000,
      });
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to publish design to marketplace");
    }
  }

  async hireMaker(data: {
    designId: string;
    requirements: string;
    quantity: number;
    deadlineDate: string;
    productTimeline: string;
    budgetRange: { min: number; max: number };
    shippingRegion: string;
    fabricSource: string;
    skillKeywords: string[];
    experienceLevel: string;
  }) {
    try {
      const res = await this.axios.post("/creator/hire-maker", data);
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to hire maker");
    }
  }

  async browseMarketplace(params?: {
    search?: string;
    category?: string;
    sortBy?: "price_asc" | "price_desc" | "newest" | "oldest";
    page?: number;
    limit?: number;
  }) {
    try {
      const res = await this.axios.get("/marketplace/browse", { params });
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to browse marketplace");
    }
  }

  async mintNFT(payload: MintNFTRequest) {
    try {
      const res = await this.axios.post("/web3/hedera/mint", payload, {
        timeout: 30000,
      });
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to mint NFT");
    }
  }

  async batchListNFTs(payload: BatchListNFTsRequest) {
    try {
      const res = await this.axios.post(
        "/web3/hedera/nfts/listings/batch",
        payload,
        {
          timeout: 30000,
        }
      );
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to list NFTs in batch");
    }
  }

  async uploadDesignDirectly(data: UploadDesignDirectlyRequest) {
    try {
      const formData = new FormData();
      formData.append("image", data.image);
      formData.append("description", data.description);

      const res = await this.axios.post(
        "/marketplace/design/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000, // Increase timeout to 30 seconds
        }
      );

      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to upload design directly");
    }
  }

  // =====================
  // Applications Methods
  // =====================
  async getAllApplications(): Promise<Application[]> {
    try {
      const res = await this.axios.get("/marketplace/creator/applications");
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to fetch all applications");
    }
  }

  async getMakerProfile(appId: string): Promise<MakerProfileResponse> {
    try {
      const res = await this.axios.get(
        `/marketplace/applications/${appId}/maker-profile`
      );
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to fetch maker profile");
    }
  }

  async declineApplication(appId: string): Promise<DeclineApplicationResponse> {
    try {
      const res = await this.axios.post(
        `/marketplace/applications/${appId}/decline`
      );
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to decline application");
    }
  }

  async acceptApplication(appId: string): Promise<AcceptApplicationResponse> {
    try {
      const res = await this.axios.post(
        `/marketplace/applications/${appId}/accept`
      );
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to accept application");
    }
  }
}

const api = new ApiClass();

// Expose api in dev only
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).api = api;
}

export default api;
export { ApiClass };
