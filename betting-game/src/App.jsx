import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import TitleSign from "./components/TitleSign";
import Roulette from "./components/Roulette";
import Loading from "./components/Loading";
import { ConnectButton, useAccounts } from "@mysten/dapp-kit";
import About from './routes/About';
import Admin from './routes/Admin';
import { BrowserRouter , Routes} from 'react-router-dom';

function Home() {
  const accounts = useAccounts();

  return (
    <div className="App page-content">
      <section className="page-section">
        {accounts.length !== 0 && (
          <div className="inner-column">
            <TitleSign />
            <Roulette />
          </div>
        )}
        {accounts.length === 0 && (
          <div className="inner-column dimmed">
            <TitleSign />
            <Roulette />
          </div>
        )}
        <Loading />
      </section>
    </div>
  );
}

function App() {
  return (
    <>
        {/* <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/admin" exact component={Admin} />
          <Route path="/about" exact component={About} />
        </Switch> */}

        <BrowserRouter>
        <header>
        <ConnectButton />
      </header>
      <main>
       <Routes>
           <Route path="/" element={<Home />} />
           <Route path="about" element={<About />} />
           <Route path="admin" element={<Admin />} />
        </Routes>
        </main>
     </BrowserRouter>
     </>
  );
}

export default App;