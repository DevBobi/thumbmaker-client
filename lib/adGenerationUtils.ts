import { AdCopy, AdTemplate, BrandTone } from "@/types/ad.types";

export const generateCopyBasedOnTone = (
  template: AdTemplate,
  productName: string,
  tone: BrandTone,
  callToAction: string,
  existingCopy?: AdCopy
): AdCopy => {
  // Return existing copy if available
  if (existingCopy) return existingCopy;

  // Create new copy based on tone and product
  let headline = "";
  let subtitle = "";
  let bodyText = "";

  switch (tone) {
    case "Friendly & Casual":
      headline = `Hey there! Check out our amazing ${productName}!`;
      subtitle = `Perfect for everyday use`;
      bodyText = `We think you'll love how easy it is to use ${productName} in your daily life.`;
      break;
    case "Professional & Concise":
      headline = `Introducing: ${productName}`;
      subtitle = `Professional Grade Quality`;
      bodyText = `Elevate your experience with our industry-leading ${productName}.`;
      break;
    case "Edgy & Humorous":
      headline = `${productName}: Because boring is so last season`;
      subtitle = `Stand out from the crowd`;
      bodyText = `Life's too short for ordinary products. Try ${productName} today!`;
      break;
    case "Inspirational & Motivational":
      headline = `Transform Your Life with ${productName}`;
      subtitle = `Achieve your dreams`;
      bodyText = `Take the first step towards a better tomorrow with ${productName}.`;
      break;
    case "Sophisticated & Luxurious":
      headline = `${productName}: The Epitome of Excellence`;
      subtitle = `Crafted for the discerning individual`;
      bodyText = `Experience unparalleled quality and sophistication with our premium ${productName}.`;
      break;
  }

  return {
    templateId: template.id,
    headline,
    subtitle,
    bodyText,
    callToAction,
  };
};
