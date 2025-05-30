import React, { useEffect, useState } from "react";
import AppNavigator from "./navigation/AppNavigator";
import { supabase } from "./lib/supabase";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AppNavigator isLoggedIn={isLoggedIn} />;
}
