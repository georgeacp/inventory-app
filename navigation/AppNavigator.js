import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProductosScreen from "../screens/ProductosScreen";
import VentaScreen from "../screens/VentaScreen";
import ReporteScreen from "../screens/ReporteScreen";
import GestionUsuariosScreen from "../screens/GestionUsuariosScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator({ isLoggedIn }) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isLoggedIn ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Registro" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Productos" component={ProductosScreen} />
            <Stack.Screen name="Venta" component={VentaScreen} />
            <Stack.Screen name="Reporte" component={ReporteScreen} />
            <Stack.Screen
              name="GestionUsuarios"
              component={GestionUsuariosScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
