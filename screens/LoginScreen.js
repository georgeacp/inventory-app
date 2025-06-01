import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import CustomButton from "../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setSuccessMessage(`Error: ${error.message}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setSuccessMessage("Login exitoso");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <Text>Email</Text>
      <TextInput
        placeholder="correo@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <Text>Contraseña</Text>
      <TextInput
        placeholder="********"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        onSubmitEditing={login}
      />

      <CustomButton title="Iniciar sesión" onPress={login} />

      <View style={{ marginTop: 10 }}>
        <CustomButton
          title="Registrarse"
          onPress={() => navigation.navigate("Register")}
          style={{ backgroundColor: "#6c757d" }}
        />
      </View>

      {successMessage !== "" && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{successMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  toast: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  toastText: {
    color: "#fff",
    textAlign: "center",
  },
});
