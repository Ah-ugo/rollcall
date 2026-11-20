import { extendTheme } from "@chakra-ui/react";

export default extendTheme({
  fonts: { heading: "Sora, system-ui, sans-serif", body: "Manrope, system-ui, sans-serif" },
  colors: {
    brand: { 50: "#EEF0FF", 100: "#DDE1FF", 200: "#B9C0FF", 300: "#8F99F7", 400: "#6C75EA", 500: "#4F46E5", 600: "#4338CA", 700: "#352DA3", 800: "#27227A", 900: "#1E1B4B" },
    ink: { 50: "#F6F7FB", 100: "#EEF0F6", 200: "#DfE2EC", 500: "#6B7089", 700: "#363B57", 900: "#161833" },
  },
  styles: { global: { body: { bg: "ink.50", color: "ink.900" } } },
  radii: { xl: "14px", "2xl": "20px" },
  components: {
    Button: { defaultProps: { colorScheme: "brand" }, baseStyle: { fontWeight: 600, borderRadius: "xl" } },
    Input: { defaultProps: { focusBorderColor: "brand.500" }, variants: { outline: { field: { borderRadius: "xl", bg: "white" } } } },
    Textarea: { defaultProps: { focusBorderColor: "brand.500" } },
    Heading: { baseStyle: { letterSpacing: "-0.02em" } },
  },
});
