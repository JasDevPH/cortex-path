import React, { useState } from "react";
import { Alert, Text, TextInput, View, TouchableOpacity } from "react-native";
import { Mail, Lock, User, ArrowRight, ChevronLeft, Eye, EyeOff, AtSign } from "lucide-react-native";
import { signUpWithEmail } from "@/lib/api";

interface SignUpProps {
    onSignInPress: () => void;
}

export default function SignUp({ onSignInPress }: SignUpProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSignUp() {
        const normalizedName = name.trim();
        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim();

        if (!normalizedName || !normalizedUsername || !normalizedEmail || !password) {
            setErrorMessage("Fill in all account details.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await signUpWithEmail(normalizedName, normalizedUsername, normalizedEmail, password);
            Alert.alert("Account created", "You can now login with your email and password.");
            onSignInPress();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to create account.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="flex-1 justify-center">
            <TouchableOpacity 
                onPress={onSignInPress} 
                className="mb-16 self-start "
            >
                <ChevronLeft color="#666" size={28} />
            </TouchableOpacity>

            <View className="mb-12">
                <Text className="text-black text-4xl font-bold">Create Account</Text>
            </View>

            <View className="gap-y-6">
                <View>
                    <View className="flex-row items-center border-b border-gray-200 pb-4 px-1">
                        <User color="#999" size={20} />
                        <View className="flex-1 ml-4">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Name</Text>
                            <TextInput
                                className="text-black text-base font-semibold h-6 p-0"
                                placeholder="Enter your name"
                                placeholderTextColor="#ccc"
                                autoComplete="name"
                                textContentType="name"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>
                </View>

                <View>
                    <View className="flex-row items-center border-b border-gray-200 pb-4 px-1">
                        <User color="#999" size={20} />
                        <View className="flex-1 ml-4">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Username</Text>
                            <TextInput
                                className="text-black text-base font-semibold h-6 p-0"
                                placeholder="Enter your username"
                                placeholderTextColor="#ccc"
                                autoComplete="name"
                                textContentType="name"
                                autoCapitalize="none"
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>
                    </View>
                </View>

                <View>
                    <View className="flex-row items-center border-b border-gray-200 pb-4 px-1">
                        <Mail color="#999" size={20} />
                        <View className="flex-1 ml-4">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Email</Text>
                            <TextInput
                                className="text-black text-base font-semibold h-6 p-0"
                                placeholder="Enter your email"
                                placeholderTextColor="#ccc"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                textContentType="emailAddress"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>
                </View>

                <View>
                    <View className="flex-row items-center border-b border-gray-200 pb-4 px-1">
                        <Lock color="#999" size={20} />
                        <View className="flex-1 ml-4">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Password</Text>
                            <TextInput
                                className="text-black text-base font-semibold h-6 p-0"
                                placeholder="Enter your password"
                                placeholderTextColor="#ccc"
                                secureTextEntry={!isPasswordVisible}
                                autoComplete="new-password"
                                textContentType="newPassword"
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>
                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                            {isPasswordVisible ? (
                                <EyeOff color="#999" size={20} />
                            ) : (
                                <Eye color="#999" size={20} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    <View className="flex-row items-center border-b border-gray-200 pb-4 px-1">
                        <Lock color="#999" size={20} />
                        <View className="flex-1 ml-4">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Confirm Password</Text>
                            <TextInput
                                className="text-black text-base font-semibold h-6 p-0"
                                placeholder="Confirm your password"
                                placeholderTextColor="#ccc"
                                secureTextEntry={!isConfirmPasswordVisible}
                                autoComplete="new-password"
                                textContentType="newPassword"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                        <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                            {isConfirmPasswordVisible ? (
                                <EyeOff color="#999" size={20} />
                            ) : (
                                <Eye color="#999" size={20} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

           {errorMessage ? (
                <Text className="text-red-500 text-sm font-semibold mt-5">{errorMessage}</Text>
            ) : null}

            <View className="items-end mt-12">
                <TouchableOpacity
                    activeOpacity={0.8}
                    className={`bg-blue-400 flex-row items-center px-10 py-4 rounded-full ${isSubmitting ? "opacity-70" : ""}`}
                    disabled={isSubmitting}
                    onPress={handleSignUp}
                >
                    <Text className="text-white text-base font-bold uppercase tracking-widest mr-2">
                        {isSubmitting ? "Creating..." : "Sign Up"}
                    </Text>
                    <ArrowRight color="white" size={20} strokeWidth={3} />
                </TouchableOpacity>
            </View>

        </View>
    );
}
