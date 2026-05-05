import { MoreHorizontal, Send, User, LogOut } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { signOut } from '../lib/api';
import { Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDebounce } from '../hooks/useDebounce';

export default function ChatUI() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, 500);
  const canSend = debouncedInput.trim().length > 0 && debouncedInput.trim() === input.trim();
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const router = useRouter();

  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.log('Failed to sign out via API', e);
    } finally {
      router.replace('/');
    }
  };

  const confirmSignOut = () => {
    setIsSignOutModalVisible(true);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' || Platform.OS === 'android'? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' || Platform.OS === 'android'? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [messages, setMessages] = useState([
    { id: 1, text: "System initialized. Secure link established.", sender: 'bot', time: '9:00 AM' },
    { id: 2, text: "Check project status.", sender: 'user', time: '9:01 AM' },
    { id: 3, text: "All modules are operating within normal parameters. Repository health is optimal.", sender: 'bot', time: '9:02 AM' },
  ]);

  const handleSend = useCallback(() => {
    if (canSend) {
      const newMessage = {
        id: messages.length + 1,
        text: input,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, newMessage]);
      setInput('');
      setIsBotTyping(true);

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: "Task completed. Waiting for next instruction.",
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setIsBotTyping(false);
      }, 1500);
    }
  }, [canSend, input, messages]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-slate-50">
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={insets.bottom}
      >
        {/* Header */}
        {!keyboardVisible && (
          <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-slate-200">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl overflow-hidden items-center justify-center">
                <Image source={require('../assets/images/logo.png')} style={{ width: 40, height: 40 }} />
              </View>
              <View className="ml-3">
                <Text className="text-slate-900 font-bold text-lg tracking-tight">ContextPath</Text>
              </View>
            </View>
            <TouchableOpacity onPress={confirmSignOut} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 items-center justify-center">
              <LogOut size={18} color="#64748b" style={{ marginLeft: -2 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              className={`mb-6 flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <View className="w-8 h-8 rounded-lg overflow-hidden items-center justify-center mr-3 self-end mb-1">
                  <Image source={require('../assets/images/logo.png')} style={{ width: 32, height: 32 }} />
                </View>
              )}

              <View className={`max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.sender === 'user' ? (
                  <View className="px-4 py-3 rounded-2xl rounded-tr-none bg-blue-600">
                    <Text className="text-white text-[15px] leading-relaxed font-medium">
                      {msg.text}
                    </Text>
                  </View>
                ) : (
                  <View className="px-4 py-3 rounded-2xl rounded-tl-none bg-white border border-slate-200">
                    <Text className="text-slate-800 text-[15px] leading-relaxed">
                      {msg.text}
                    </Text>
                  </View>
                )}
                <Text className="text-slate-400 text-[10px] mt-1.5 font-semibold uppercase tracking-wider px-1">{msg.time}</Text>
              </View>

              {msg.sender === 'user' && (
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center ml-3 self-end mb-1">
                  <User size={16} color="#2563eb" />
                </View>
              )}
            </View>
          ))}
          {isBotTyping && (
            <View className="mb-6 flex-row justify-start items-end">
              <View className="w-8 h-8 rounded-lg overflow-hidden items-center justify-center mr-3 mb-1">
                <Image source={require('../assets/images/logo.png')} style={{ width: 32, height: 32 }} />
              </View>
              <View className="px-5 py-3 rounded-2xl rounded-tl-none bg-white border border-slate-200 shadow-sm">
                <MoreHorizontal size={24} color="#94a3b8" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View
          className="px-4 pt-3 bg-white border-t border-slate-100"
          style={{ paddingBottom: keyboardVisible ? 16 : Math.max(insets.bottom, 16) }}
        >
          <View className={`flex-row items-end bg-slate-50 border rounded-[20px] px-4 py-2 ${keyboardVisible ? 'border-blue-400' : 'border-slate-200'}`}>
            <TextInput
              placeholder="Enter instruction..."
              placeholderTextColor="#94a3b8"
              style={{ minHeight: 32, maxHeight: 120, paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: Platform.OS === 'ios' ? 8 : 4 }}
              className="flex-1 text-slate-900 text-[16px]"
              value={input}
              onChangeText={setInput}
              multiline={true}
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!canSend}
              className={`ml-2 w-9 h-9 rounded-full items-center justify-center mb-[2px] ${canSend ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <Send size={16} color={canSend ? "white" : "#94a3b8"} style={{ marginLeft: canSend ? 2 : 0 }} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={isSignOutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSignOutModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <View className="bg-white w-full rounded-[24px] p-6 shadow-xl" style={{ maxWidth: 320 }}>
            <Text className="text-xl font-bold text-slate-900 mb-2 text-center">Log Out</Text>
            <Text className="text-base text-slate-500 mb-6 text-center">Are you sure you want to log out?</Text>
            
            <View className="flex-row justify-between" style={{ gap: 12 }}>
              <TouchableOpacity 
                className="flex-1 py-3.5 rounded-2xl bg-slate-100"
                onPress={() => setIsSignOutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text className="text-slate-700 text-center font-semibold text-base">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 py-3.5 rounded-2xl bg-red-500"
                onPress={() => {
                  setIsSignOutModalVisible(false);
                  handleSignOut();
                }}
                activeOpacity={0.7}
              >
                <Text className="text-white text-center font-semibold text-base">Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
