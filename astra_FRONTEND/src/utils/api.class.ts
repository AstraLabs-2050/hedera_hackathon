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
  // Define the payload structure you’re sending
  contractAddress: string;
  tokenId: string;
  metadata: Record<string, any>;
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
// API Class
// ============================

class ApiClass {
  private axios;

  constructor() {
    this.axios = instance;
  }

  private handleError(error: any, defaultMessage: string): never {
    const message =
      error?.response?.data?.message || error?.message || defaultMessage;
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
        timeout: 30000,
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

  async mintNFT(payload: {
    chatId?: string;
    selectedVariation?: string;
    designId?: string;
    paymentTransactionHash: string;
    name: string;
  }) {
    try {
      const res = await this.axios.post("/web3/nft/mint", payload);
      return res.data;
    } catch (err) {
      this.handleError(err, "Failed to mint NFT");
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
}

const api = new ApiClass();

// Expose api in dev only
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).api = api;
}

export default api;
export { ApiClass };

// class ApiClass {
//   private axios;

//   constructor() {
//     this.axios = instance;
//   }

//   private handleError(error: any, defaultMessage: string): never {
//     const message =
//       error?.response?.data?.message || error?.message || defaultMessage;
//     throw new Error(message);
//   }

//   // Auth Methods
//   async registerCreator(
//     data: RegisterCreatorRequest
//   ): Promise<RegisterCreatorResponse> {
//     try {
//       const response = await this.axios.post("/auth/register", data);
//       return response.data;
//     } catch (error) {
//       this.handleError(error, "Failed to register creator");
//     }
//   }

//   async verifyCreatorOTP(
//     data: VerifyCreatorOTPRequest
//   ): Promise<VerifyCreatorOTPResponse> {
//     try {
//       const response = await this.axios.post("/auth/verify-otp", data);
//       return response.data;
//     } catch (error) {
//       this.handleError(error, "Failed to verify OTP");
//     }
//   }

//   async login(data: {
//     email: string;
//     password: string;
//   }): Promise<LoginResponse> {
//     try {
//       const response = await this.axios.post("/auth/login", data);
//       return response.data;
//     } catch (error) {
//       this.handleError(error, "Login failed");
//     }
//   }

//   async createBrandDetails(
//     brandName: string,
//     brandOrigin: string,
//     brandStory: string,
//     brandLogo: File
//   ): Promise<CreateBrandDetailsResponse> {
//     try {
//       // Validate file type
//       if (!["image/jpeg", "image/jpg"].includes(brandLogo.type)) {
//         throw new Error(
//           "Only JPG and JPEG formats are accepted for brand logo"
//         );
//       }

//       const formData = new FormData();
//       formData.append("brandName", brandName);
//       formData.append("brandOrigin", brandOrigin);
//       formData.append("brandStory", brandStory);
//       formData.append("brandLogo", brandLogo);

//       const response = await this.axios.post("/users/brand-details", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       return response.data;
//     } catch (error) {
//       this.handleError(error, "Failed to create brand details");
//     }
//   }

//   // Chat Methods
//   public async startChat(): Promise<StartChatResponse> {
//     try {
//       const response = await this.axios.post("/ai-chat/start");
//       return response.data as StartChatResponse;
//     } catch (err: any) {
//       throw new Error(
//         err?.response?.data?.message || err.message || "Failed to start chat"
//       );
//     }
//   }

//   public async sendMessage(
//     data: SendMessageRequest
//   ): Promise<SendMessageResponse> {
//     try {
//       const response = await this.axios.post("/ai-chat/message", data);
//       return response.data as SendMessageResponse;
//     } catch (err: any) {
//       throw new Error(
//         err?.response?.data?.message || err.message || "Failed to send message"
//       );
//     }
//   }

//   public async getStreamChatToken(): Promise<StreamChatTokenResponse> {
//     try {
//       const response = await this.axios.get("/ai-chat/token");
//       return response.data as StreamChatTokenResponse;
//     } catch (err: any) {
//       throw new Error(
//         err?.response?.data?.message ||
//           err.message ||
//           "Failed to fetch Stream Chat token"
//       );
//     }
//   }

//   public async getAllChats(): Promise<GetAllChatsResponse> {
//     try {
//       const response = await this.axios.get("/ai-chat");
//       return response.data as GetAllChatsResponse;
//     } catch (err: any) {
//       throw new Error(
//         err?.response?.data?.message || err.message || "Failed to fetch chats"
//       );
//     }
//   }

//   public async getChatById(chatId: string): Promise<GetChatByIdResponse> {
//     try {
//       const response = await this.axios.get(`/ai-chat/${chatId}`);
//       return response.data as GetChatByIdResponse;
//     } catch (err: any) {
//       console.error(
//         "Error fetching chat:",
//         err?.response?.data || err?.message || err
//       );
//       throw new Error(
//         err?.response?.data?.message || err.message || "Failed to fetch chat"
//       );
//     }
//   }

//   // Creator Methods
//   async getCreatorInventory() {
//     try {
//       const response = await this.axios.get("/creator/inventory");
//       return response.data;
//     } catch (error) {
//       this.handleError(error, "Failed to fetch creator inventory");
//     }
//   }

//   async getCreatorInventoryById(designId: string) {
//     try {
//       const response = await this.axios.get(`/creator/inventory/${designId}`);
//       return response.data;
//     } catch (error) {
//       this.handleError(error, "Failed to fetch creator inventory by ID");
//     }
//   }

//   async publishToMarketplace(data: {
//     designId: string;
//     pricePerOutfit: number;
//     quantityAvailable: number;
//     deliveryWindow: string;
//     brandStory: string;
//     regionOfDelivery: string;
//   }) {
//     const maxRetries = 2;
//     let attempt = 0;

//     while (attempt <= maxRetries) {
//       try {
//         const response = await this.axios.post(
//           "/creator/publish-marketplace",
//           data,
//           { timeout: 30000 } // Ensure reasonable timeout
//         );
//         return response.data;
//       } catch (error: any) {
//         if (error?.response?.status === 500 && attempt < maxRetries) {
//           attempt++;
//           const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s
//           await new Promise((resolve) => setTimeout(resolve, delay));
//           continue;
//         }

//         this.handleError(
//           "Publish: ",
//           "Failed to publish design to marketplace"
//         );
//       }
//     }
//     throw new Error("Failed to publish design to marketplace after retries");
//   }

//   async hireMaker(data: {
//     designId: string;
//     requirements: string;
//     quantity: number;
//     deadlineDate: string;
//     productTimeline: string;
//     budgetRange: { min: number; max: number };
//     shippingRegion: string;
//     fabricSource: string;
//     skillKeywords: string[];
//     experienceLevel: string;
//   }) {
//     try {
//       const response = await this.axios.post("/creator/hire-maker", data);
//       return response.data;
//     } catch (error) {
//       this.handleError(error, "Failed to hire maker");
//     }
//   }

//   public async browseMarketplace(
//     params?: BrowseMarketplaceParams
//   ): Promise<BrowseMarketplaceResponse> {
//     try {
//       const response = await this.axios.get("/marketplace/browse", {
//         params,
//       });
//       return response.data as BrowseMarketplaceResponse;
//     } catch (err: any) {
//       throw new Error(
//         err?.response?.data?.message ||
//           err.message ||
//           "Failed to browse marketplace"
//       );
//     }
//   }

//   async mintNFT(payload: MintNFTRequest): Promise<MintNFTResponse> {
//     try {
//       const res = await instance.post<MintNFTResponse>(
//         `/web3/nft/mint`,
//         payload
//       );
//       return res.data;
//     } catch (error: any) {
//       throw new Error(error.response?.data?.message || "Failed to mint NFT");
//     }
//   }
// }

// const api = new ApiClass();

// // Only expose to window in development
// if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
//   (window as any).api = api;
// }

// export default api;
// export { ApiClass };
