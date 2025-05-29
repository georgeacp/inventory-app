import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, FlatList } from "react-native";
import { supabase } from "../lib/supabase";

export default function VentaScreen({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState("");

  const cargarProductos = async () => {
    const { data, error } = await supabase.from("productos").select("*");
    if (error) Alert.alert("Error al cargar productos", error.message);
    else setProductos(data);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const registrarVenta = async () => {
    if (!productoSeleccionado || !cantidad) {
      Alert.alert("Faltan datos", "Selecciona un producto y cantidad válida.");
      return;
    }

    const producto = productos.find((p) => p.id === productoSeleccionado);
    const cantidadNum = parseInt(cantidad);

    if (cantidadNum <= 0 || cantidadNum > producto.stock) {
      Alert.alert("Cantidad inválida", "Revisa el stock disponible.");
      return;
    }

    // 1. Crear venta vacía
    const { data: ventaInsertada, error: errorVenta } = await supabase
      .from("ventas")
      .insert([{ total: cantidadNum * producto.precio }])
      .select()
      .single();

    if (errorVenta) {
      Alert.alert("Error al crear venta", errorVenta.message);
      return;
    }

    const ventaId = ventaInsertada.id;

    const { error: errorDetalle } = await supabase
      .from("venta_detalle")
      .insert([
        {
          venta_id: ventaId,
          producto_id: producto.id,
          cantidad: cantidadNum,
          precio_unitario: producto.precio,
        },
      ]);

    if (errorDetalle) {
      Alert.alert("Error en detalle de venta", errorDetalle.message);
      return;
    }

    const { error: errorStock } = await supabase
      .from("productos")
      .update({ stock: producto.stock - cantidadNum })
      .eq("id", producto.id);

    if (errorStock) {
      Alert.alert(
        "Venta registrada, pero error actualizando stock",
        errorStock.message
      );
    } else {
      Alert.alert("✅ Venta registrada con éxito");
      setCantidad("");
      setProductoSeleccionado(null);
      await cargarProductos(); // 👈 Recargar productos para actualizar stock
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Registrar Venta</Text>

      <Text>Selecciona un producto:</Text>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Button
            title={`${item.nombre} - Stock: ${item.stock}`}
            onPress={() => setProductoSeleccionado(item.id)}
            color={productoSeleccionado === item.id ? "green" : "gray"}
          />
        )}
        style={{ marginBottom: 15 }}
      />

      <Text>Cantidad</Text>
      <TextInput
        keyboardType="numeric"
        value={cantidad}
        onChangeText={setCantidad}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 15,
        }}
      />

      <Button title="Registrar Venta" onPress={registrarVenta} />
      <View style={{ marginTop: 10 }}>
        <Button
          title="📄 Ver reporte de ventas"
          onPress={() => navigation.navigate("Reporte")}
        />
      </View>
    </View>
  );
}
