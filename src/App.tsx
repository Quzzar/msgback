import {
  ColorSchemeProvider,
  MantineProvider,
  AppShell,
} from "@mantine/core";
import { HeaderResponsive } from "./HeaderResponsive";
import MsgPage from "./MsgPage";

function App() {
  return (
    <ColorSchemeProvider colorScheme={"light"} toggleColorScheme={() => {}}>
      <MantineProvider
        theme={{
          colorScheme: "light",
          fontFamily: 'Poppins, sans-serif',
        }}
        withGlobalStyles
        withNormalizeCSS
      >
          <AppShell
            padding="md"
            header={<HeaderResponsive />}
            styles={(theme) => ({
              main: {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[8]
                    : theme.colors.gray[0],
                padding: 0,
                minHeight: 'initial',
                display: 'flex',
                justifyContent: 'space-around',
              },
            })}
          >
            <MsgPage />
          </AppShell>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default App;
