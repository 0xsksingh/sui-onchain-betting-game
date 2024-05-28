import TitleSign from "./components/TitleSign";
import Roulette from "./components/Roulette";
import Loading from "./components/Loading";

import { ConnectButton , useAccounts} from "@mysten/dapp-kit";

function App() {

  const accounts = useAccounts();

  return (
    <>
      <header>
        <ConnectButton />
      </header>
      <main className="App page-content">
        <section className="page-section">
          {accounts.length !== 0  && (
            <inner-column>
              <TitleSign />
              <Roulette />
            </inner-column>
          )}
          {accounts.length === 0  && (
            <inner-column class="dimmed">
              <TitleSign />
              <Roulette />
            </inner-column>
          )}

          <Loading />
        </section>
      </main>
    </>
  );
}

export default App;
