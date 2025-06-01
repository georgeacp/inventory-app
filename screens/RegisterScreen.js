import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import CustomButton from "../components/CustomButton";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { supabase } from "../lib/supabase";

const schema = yup.object().shape({
  nombre: yup.string().required("Nombre es obligatorio"),
  email: yup
    .string()
    .email("Correo inválido")
    .required("Correo es obligatorio"),
  password: yup
    .string()
    .min(6, "Mínimo 6 caracteres")
    .required("Contraseña es obligatoria"),
  rol: yup
    .string()
    .oneOf(
      ["cliente", "proveedor", "vendedor"],
      "Rol debe ser cliente, proveedor o vendedor"
    )
    .required("Rol es obligatorio"),
});

export default function RegisterScreen({ navigation }) {
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async ({ email, password, nombre, rol }) => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
      }
    );

    if (signUpError) {
      Alert.alert("Error en registro", signUpError.message);
      return;
    }

    const user = signUpData.user;
    if (!user) {
      Alert.alert("Error", "No se pudo obtener el usuario");
      return;
    }

    const { data: rolData, error: rolError } = await supabase
      .from("roles")
      .select("id")
      .eq("nombre", rol)
      .single();

    if (rolError || !rolData) {
      Alert.alert(
        "Error obteniendo rol",
        rolError?.message || "Rol no encontrado"
      );
      return;
    }

    const { error: insertError } = await supabase.from("usuarios").insert([
      {
        user_id: user.id,
        nombre,
        rol_id: rolData.id,
      },
    ]);

    if (insertError) {
      Alert.alert("Error guardando usuario", insertError.message);
      return;
    }

    setSuccessMessage("Usuario registrado correctamente");
    reset();

    setTimeout(() => {
      setSuccessMessage("");
      // Puedes redirigir automáticamente si quieres:
      // navigation.navigate("Login");
    }, 2000);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Registro de Usuario
      </Text>

      <Text>Nombre</Text>
      <Controller
        control={control}
        name="nombre"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <TextInput
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />

      <Text>Correo</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <TextInput
              keyboardType="email-address"
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
              style={styles.input}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />

      <Text>Contraseña</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <TextInput
              secureTextEntry
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
              style={styles.input}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />

      <Text>Rol (vendedor, cliente o proveedor)</Text>
      <Controller
        control={control}
        name="rol"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <TextInput
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
              style={styles.input}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />

      <CustomButton title="Registrarse" onPress={handleSubmit(onSubmit)} />

      <View style={{ marginTop: 10 }}>
        <CustomButton
          title="Volver a Login"
          onPress={() => navigation.navigate("Login")}
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

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
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
};
