import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [productos, setProductos] = useState([]);
  const [accesoAdmin, setAccesoAdmin] = useState(false); // Estado para verificar si es admin

  useEffect(() => {
    const fetchDatosUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nombre, activo, creado_en, roles (nombre)")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setUsuario(data);
        if (data?.roles?.nombre === "cliente") {
          const { data: productosData, error: productosError } = await supabase
            .from("productos")
            .select("*");
          if (!productosError) setProductos(productosData);
        }

        if (data?.roles?.nombre === "admin") {
          setAccesoAdmin(true); // Permitir acceso si es admin
        }
      }

      setLoading(false);
    };

    fetchDatosUsuario();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    reset();
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  return (
    <View style={[styles.container, { justifyContent: "center" }]}>
      <Text style={styles.welcomeText}>Bienvenido, {usuario?.nombre}</Text>
      <Text style={styles.roleText}>Rol: {usuario?.roles?.nombre}</Text>

      {usuario?.roles?.nombre === "cliente" ? (
        <View style={{ marginTop: 20, width: "100%" }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            📋 Lista de productos:
          </Text>
          {loading ? (
            <ActivityIndicator />
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
      ) : (
        <Text style={styles.providerMessage}>
          📦 Acceso a gestión de inventario y ventas.
        </Text>
      )}

      {usuario?.roles?.nombre === "proveedor" && (
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Productos")}
            style={styles.manageButton}
          >
            <Text style={styles.buttonText}>Gestionar productos</Text>
          </TouchableOpacity>
        </View>
      )}

      {usuario?.roles?.nombre === "vendedor" && (
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Venta")}
            style={styles.manageButton}
          >
            <Text style={styles.buttonText}>Registrar venta</Text>
          </TouchableOpacity>
        </View>
      )}

      {accesoAdmin && (
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("GestionUsuarios")}
            style={styles.manageButton}
          >
            <Text style={styles.buttonText}>Gestionar Usuarios</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  roleText: {
    fontSize: 18,
    marginBottom: 20,
  },
  providerMessage: {
    fontSize: 16,
    color: "#1976d2",
    marginTop: 20,
  },
  manageButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginTop: 30,
    width: "80%",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 5,
    marginTop: 30,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loading: {
    marginTop: 40,
  },
});
