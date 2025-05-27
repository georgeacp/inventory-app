import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, Switch } from "react-native";
import { supabase } from "../lib/supabase";

export default function GestionUsuariosScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [adminRolId, setAdminRolId] = useState(null);

  useEffect(() => {
    const cargarUsuarios = async () => {
      // Obtener ID del rol 'admin'
      const { data: rolData, error: rolError } = await supabase
        .from("roles")
        .select("id")
        .eq("nombre", "admin")
        .single();

      if (rolError) {
        Alert.alert("Error obteniendo rol admin", rolError.message);
        return;
      }

      setAdminRolId(rolData.id);

      // Obtener usuarios que NO son admin, incluyendo el nombre del rol
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nombre, activo, rol_id, roles(nombre)") // Agregar el nombre del rol
        .neq("rol_id", rolData.id);

      if (error) {
        Alert.alert("Error cargando usuarios", error.message);
      } else {
        setUsuarios(data);
      }
    };

    cargarUsuarios();
  }, []);

  const toggleActivo = async (usuarioId, estadoActual) => {
    const { error } = await supabase
      .from("usuarios")
      .update({ activo: !estadoActual })
      .eq("id", usuarioId);

    if (error) {
      Alert.alert("Error actualizando estado", error.message);
    } else {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === usuarioId ? { ...u, activo: !estadoActual } : u
        )
      );
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              marginBottom: 10,
              padding: 10,
              borderWidth: 1,
              borderRadius: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={{ fontSize: 16 }}>{item.nombre}</Text>
              <Text style={{ color: "gray", fontSize: 12 }}>
                Rol: {item.roles?.nombre}
              </Text>
              <Text style={{ color: "gray" }}>
                Estado: {item.activo ? "Activo" : "Inactivo"}
              </Text>
            </View>
            <Switch
              value={item.activo}
              onValueChange={() => toggleActivo(item.id, item.activo)}
            />
          </View>
        )}
      />
    </View>
  );
}
