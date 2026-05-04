import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import "../global.css";
import { cssInterop } from "nativewind";
import { MoreHorizontal, MoveRight, User } from "lucide-react-native";

cssInterop(MoreHorizontal, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});
cssInterop(MoveRight, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});
cssInterop(User, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});


export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="chat" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}