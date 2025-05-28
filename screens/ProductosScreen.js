import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function ProductosScreen() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
  });

  // Función para obtener los productos de la base de datos
  const fetchProductos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("productos").select("*");

    if (error) {
      Alert.alert("Error al cargar productos", error.message);
    } else {
      setProductos(data);
    }
    setLoading(false);
  };

  // Función para agregar un nuevo producto
  const agregarProducto = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase.from("productos").insert({
      nombre: nuevo.nombre,
      descripcion: nuevo.descripcion,
      precio: parseFloat(nuevo.precio),
      stock: parseInt(nuevo.stock),
      proveedor_id: user.id, // Se utiliza el ID del proveedor del usuario autenticado
    });

    if (error) {
      Alert.alert("Error al agregar producto", error.message);
    } else {
      setNuevo({ nombre: "", descripcion: "", precio: "", stock: "" });
      fetchProductos();
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        📦 Gestión de Productos
      </Text>

      <TextInput
        placeholder="Nombre"
        value={nuevo.nombre}
        onChangeText={(text) => setNuevo({ ...nuevo, nombre: text })}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 10,
          marginBottom: 15,
        }}
      />
      <TextInput
        placeholder="Descripción"
        value={nuevo.descripcion}
        onChangeText={(text) => setNuevo({ ...nuevo, descripcion: text })}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 10,
          marginBottom: 15,
        }}
      />
      <TextInput
        placeholder="Precio"
        value={nuevo.precio}
        onChangeText={(text) => setNuevo({ ...nuevo, precio: text })}
        keyboardType="decimal-pad"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 10,
          marginBottom: 15,
        }}
      />
      <TextInput
        placeholder="Stock"
        value={nuevo.stock}
        onChangeText={(text) => setNuevo({ ...nuevo, stock: text })}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 10,
          marginBottom: 15,
        }}
      />

      <Button title="Agregar producto" onPress={agregarProducto} />

      <Text style={{ fontSize: 18, marginBottom: 10, marginTop: 20 }}>
        📋 Lista de productos:
      </Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 5 }}>
              <Text>
                {item.nombre} - ${item.precio} - Stock: {item.stock}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
