import { AdData, AdCopy, AdTemplate, ChatMessage } from "@/types/ad.types";
import { generateCopyBasedOnTone } from "@/lib/adGenerationUtils";

export const initialAdData: AdData = {
  product: null,
  mediaFiles: [],
  brandTone: null,
  additionalContext: "",
  callToAction: "",
  additionalInstructions: "",
  selectedTemplates: [],
  adCopy: [],
  generatedAds: [],
};

type AdAction =
  | { type: "UPDATE_AD_DATA"; payload: Partial<AdData> }
  | { type: "RESET_AD_DATA" }
  | { type: "ADD_MEDIA_FILE"; payload: File }
  | { type: "REMOVE_MEDIA_FILE"; payload: number }
  | { type: "ADD_TEMPLATE"; payload: AdTemplate }
  | { type: "REMOVE_TEMPLATE"; payload: string }
  | { type: "ADD_CUSTOM_TEMPLATE"; payload: AdTemplate }
  | { type: "UPDATE_AD_COPY"; payload: AdCopy }
  | { type: "GENERATE_AD_COPY" }
  | { type: "GENERATE_ADS" }
  | {
      type: "ADD_CHAT_MESSAGE";
      payload: {
        adId: string;
        threadId: string;
        message: Omit<ChatMessage, "id">;
      };
    }
  | { type: "CREATE_CHAT_THREAD"; payload: { adId: string; title: string } };

export const adReducer = (state: AdData, action: AdAction): AdData => {
  switch (action.type) {
    case "UPDATE_AD_DATA":
      return { ...state, ...action.payload };

    case "RESET_AD_DATA":
      return initialAdData;

    case "ADD_MEDIA_FILE":
      return {
        ...state,
        mediaFiles: [...state.mediaFiles, action.payload],
      };

    case "REMOVE_MEDIA_FILE":
      return {
        ...state,
        mediaFiles: state.mediaFiles.filter((_, i) => i !== action.payload),
      };

    case "ADD_TEMPLATE":
      if (state.selectedTemplates.find((t) => t.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        selectedTemplates: [...state.selectedTemplates, action.payload],
      };

    case "REMOVE_TEMPLATE":
      return {
        ...state,
        selectedTemplates: state.selectedTemplates.filter(
          (t) => t.id !== action.payload
        ),
        adCopy: state.adCopy.filter((c) => c.templateId !== action.payload),
      };

    case "ADD_CUSTOM_TEMPLATE":
      return {
        ...state,
        selectedTemplates: [action.payload, ...state.selectedTemplates],
      };

    case "UPDATE_AD_COPY":
      const existingIndex = state.adCopy.findIndex(
        (c) => c.templateId === action.payload.templateId
      );

      if (existingIndex >= 0) {
        const updatedCopies = [...state.adCopy];
        updatedCopies[existingIndex] = action.payload;
        return {
          ...state,
          adCopy: updatedCopies,
        };
      } else {
        return {
          ...state,
          adCopy: [...state.adCopy, action.payload],
        };
      }

    case "GENERATE_AD_COPY":
      const productName = state.product?.name || "Product";
      const tone = state.brandTone || "Professional & Concise";
      const callToAction = state.callToAction || "Buy Now";

      const newCopies = state.selectedTemplates.map((template) => {
        // Check if we already have copy for this template
        const existingCopy = state.adCopy.find(
          (c) => c.templateId === template.id
        );
        return generateCopyBasedOnTone(
          template,
          productName,
          tone,
          callToAction,
          existingCopy
        );
      });

      return {
        ...state,
        adCopy: newCopies,
      };

    default:
      return state;
  }
};
