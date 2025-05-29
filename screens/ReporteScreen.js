import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export default function ReporteScreen() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarReporteVentas = async () => {
      const { data, error } = await supabase
        .from("ventas")
        .select(
          `
          id,
          fecha,
          total,
          venta_detalle (
            producto_id,
            cantidad,
            precio_unitario,
            producto_id (
              nombre,
              descripcion
            )
          )
        `
        )
        .order("fecha", { ascending: false });

      if (error) {
        Alert.alert("Error al cargar el reporte", error.message);
        setLoading(false);
      } else {
        setVentas(data);
        setLoading(false);
      }
    };

    cargarReporteVentas();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  const renderItem = ({ item }) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>
        Venta #{item.id} - {new Date(item.fecha).toLocaleString()}
      </Text>
      <Text>Total Venta: ${item.total}</Text>

      {item.venta_detalle.map((detalle) => (
        <View key={detalle.producto_id} style={{ marginLeft: 10 }}>
          <Text>Producto: {detalle.producto_id.nombre}</Text>
          <Text>Descripción: {detalle.producto_id.descripcion}</Text>
          <Text>Cantidad: {detalle.cantidad}</Text>
          <Text>Precio Unitario: ${detalle.precio_unitario}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Reporte de Ventas</Text>
      <FlatList
        data={ventas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}
