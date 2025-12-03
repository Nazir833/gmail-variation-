import React from 'react';
import Header from './components/Header';
import EmailGenerator from './components/EmailGenerator';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <EmailGenerator />
      </main>
      <Footer />
    </div>
  );
};

export default App;