import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { Process } from './components/Process';
import { Work } from './components/Work';
import { Results } from './components/Results';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { Lead } from './types';
import { supabase } from './services/supabase';
import { PublicProposalViewer } from './components/PublicProposalViewer';
import { PublicPaymentViewer } from './components/PublicPaymentViewer';
import { ClientDataForm } from './components/ClientDataForm';
import { PublicContractViewer } from './components/PublicContractViewer';
import { PublicBriefingViewer } from './components/PublicBriefingViewer';
import { Proposal } from './types';

function App() {
  const [introStage, setIntroStage] = useState('drawing'); // drawing, transitioning, ready
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [publicProposal, setPublicProposal] = useState<Proposal | null>(null);
  const [contractFormParams, setContractFormParams] = useState<{ contractId: string; clientName: string } | null>(null);
  const [publicPayment, setPublicPayment] = useState<any>(null);
  const [publicContract, setPublicContract] = useState<any>(null);
  const [publicBriefing, setPublicBriefing] = useState<any>(null);

  useEffect(() => {
    if (introStage === 'drawing') {
      const timer = setTimeout(() => {
        setIntroStage('transitioning');
      }, 5500);
      return () => clearTimeout(timer);
    } else if (introStage === 'transitioning') {
      const timer = setTimeout(() => {
        setIntroStage('ready');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [introStage]);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) fetchLeads();
    });

    // Check for admin query param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setShowAdminLogin(true);
      setIntroStage('ready'); // Skip intro if admin
    }

    // Check for proposal public link
    const proposalId = urlParams.get('proposal_id');
    if (proposalId) {
      const storedProposals = localStorage.getItem('proposals_db');
      if (storedProposals) {
        const proposals: Proposal[] = JSON.parse(storedProposals);
        const found = proposals.find((p: any) => p.id.toString() === proposalId);
        if (found) setPublicProposal(found);
      }
    }

    // Check for contract client data form link
    const contractFormId = urlParams.get('contract_form');
    const contractClientName = urlParams.get('client');
    if (contractFormId && contractClientName) {
      setContractFormParams({ contractId: contractFormId, clientName: decodeURIComponent(contractClientName) });
    }

    // Check for public contract signing link
    const contractId = urlParams.get('contract_id');
    if (contractId) {
      const storedContracts = localStorage.getItem('contracts_db');
      if (storedContracts) {
        const contracts: any[] = JSON.parse(storedContracts);
        const found = contracts.find((c: any) => c.id.toString() === contractId);
        if (found) setPublicContract(found);
      }
    }

    // Check for public payment via Pix
    const payDataStr = urlParams.get('pay_data');
    if (payDataStr) {
      try {
        const decoded = JSON.parse(atob(payDataStr));
        setPublicPayment(decoded);
      } catch (e) {
        console.error("Invalid payment link", e);
      }
    }

    // Check for briefing public link
    const briefingId = urlParams.get('briefing_id');
    const briefingClientName = urlParams.get('client_name');
    const briefingCompanyName = urlParams.get('company_name');
    const briefingNiche = urlParams.get('niche');
    const briefingEmail = urlParams.get('email');
    if (briefingId === 'new') {
      setPublicBriefing({
        id: 'new',
        client_name: briefingClientName ? decodeURIComponent(briefingClientName) : 'Futuro Parceiro',
        status: 'pending',
        responses: {
          ...(briefingCompanyName ? { company_name: decodeURIComponent(briefingCompanyName) } : {}),
          ...(briefingNiche ? { niche: decodeURIComponent(briefingNiche) } : {}),
          ...(briefingEmail ? { email: decodeURIComponent(briefingEmail) } : {})
        }
      });
    } else if (briefingId) {
      supabase.from('briefings').select('*').eq('id', briefingId).single().then(({ data, error }) => {
        if (data && !error) setPublicBriefing(data);
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Check if email is confirmed (Supabase specific behavior)
        // If 400 error happens on fetch, we can assume it's this or other auth issue
        setIsAuthenticated(true);
        fetchLeads();
      } else {
        setIsAuthenticated(false);
      }
    });

    // Realtime subscription for leads
    const channel = supabase
      .channel('leads_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      console.error('Error fetching leads:', error);
      // Alert the user to the specific error instead of auto-signing out blindly
      alert(`Erro ao carregar dados: ${error.message} (Código: ${error.code})`);

      // Only sign out if it's explicitly a "Bad Request" (often missing credentials) 
      // AND unrelated to RLS (RLS usually returns 401 or 403, but sometimes an empty array)
      if (error.code === '400' && (error.message.includes('confirmed') || error.message.includes('credentials'))) {
        console.warn('Authentication issue detected. Signing out...');
        await supabase.auth.signOut();
        setIsAuthenticated(false);
      }
    } else {
      // Map Supabase data to Lead type if necessary, or ensure DB columns match
      // For now assuming direct mapping fits or we accept potential extra fields
      const mappedLeads: Lead[] = data.map((l: any) => ({
        id: l.id,
        name: l.name,
        company: l.company || l.company_name || 'N/A',
        status: l.status || 'Novo Lead',
        value: l.estimated_value ? `R$ ${l.estimated_value}` : 'A definir',
        date: new Date(l.created_at).toLocaleDateString('pt-BR'),
        priority: l.tag === 'quente' ? 'High' : l.tag === 'morno' ? 'Medium' : 'Low',
        email: l.email,
        phone: l.phone,
        niche: l.niche,
        revenue: l.revenue,
        growthGoal: l.growth_goal,
        bottleneck: l.bottleneck,
        estimatedBudget: l.estimated_budget
      }));
      setLeads(mappedLeads);
    }
  };

  const handleNewLeadFromContact = async (formData: {
    name: string;
    email: string;
    whatsapp: string;
    service: string;
    message: string;
    niche: string;
    revenue: string;
    growthGoal: string;
    bottleneck: string;
    estimatedBudget: string;
  }) => {
    // Optimistic UI update
    const newLeadMock: Lead = {
      id: Date.now(),
      name: formData.name,
      company: 'N/A',
      status: 'Novo Lead',
      value: 'A definir',
      email: formData.email,
      phone: formData.whatsapp,
      date: 'Hoje',
      priority: 'Medium',
      niche: formData.niche,
      revenue: formData.revenue,
      growthGoal: formData.growthGoal,
      bottleneck: formData.bottleneck,
      estimatedBudget: formData.estimatedBudget
    };
    setLeads(prevLeads => [newLeadMock, ...prevLeads]);

    // Insert into Supabase
    const { error } = await supabase.from('leads').insert({
      name: formData.name,
      email: formData.email,
      phone: formData.whatsapp,
      company_name: null,
      challenge: formData.service ? `Serviço de Interesse: ${formData.service}\n\nMensagem: ${formData.message}` : formData.message,
      status: 'Novo Lead',
      niche: formData.niche,
      revenue: formData.revenue,
      growth_goal: formData.growthGoal,
      bottleneck: formData.bottleneck,
      estimated_budget: formData.estimatedBudget
    });

    if (error) {
      console.error("Error inserting lead:", error);
    } else {
      if (isAuthenticated) fetchLeads(); // Refresh if admin
    }
  };

  // If briefing form
  if (publicBriefing) {
    return (
      <PublicBriefingViewer
        briefing={publicBriefing}
        onSubmit={async (id, responses, score) => {
          const finalClientName = responses.company_name || publicBriefing.client_name;

          if (id === 'new') {
            await supabase.from('briefings').insert({
              client_name: finalClientName,
              responses,
              maturity_score: score,
              status: 'completed',
              completed_at: new Date().toISOString(),
            });
          } else {
            await supabase.from('briefings').update({
              responses,
              maturity_score: score,
              status: 'completed',
              completed_at: new Date().toISOString(),
            }).eq('id', id);
          }

          setPublicBriefing((prev: any) => prev ? { ...prev, status: 'completed', responses, maturity_score: score, client_name: finalClientName } : prev);

          // Admin notification
          const notifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
          notifs.unshift({
            id: Date.now(),
            type: 'briefing_completed',
            text: `📋 ${finalClientName} completou o diagnóstico estratégico! Score: ${score}%`,
            time: 'Agora mesmo',
            read: false,
          });
          localStorage.setItem('admin_notifications', JSON.stringify(notifs));
        }}
      />
    );
  }

  // If client data form link
  if (contractFormParams) {
    return (
      <ClientDataForm
        contractId={contractFormParams.contractId}
        clientName={contractFormParams.clientName}
      />
    );
  }

  // If viewing a public payment
  if (publicPayment) {
    return <PublicPaymentViewer data={publicPayment} />;
  }

  // If viewing a public contract for signing
  if (publicContract) {
    return (
      <PublicContractViewer
        contract={publicContract}
        onSign={(id) => {
          // Persist signed status to localStorage
          const stored = localStorage.getItem('contracts_db') || '[]';
          const all: any[] = JSON.parse(stored);
          const signedDate = new Date().toLocaleDateString('pt-BR');
          const updated = all.map((c: any) =>
            c.id.toString() === id.toString()
              ? { ...c, status: 'Assinado', signedDate }
              : c
          );
          localStorage.setItem('contracts_db', JSON.stringify(updated));
          setPublicContract((prev: any) => prev ? { ...prev, status: 'Assinado', signedDate } : prev);

          // Admin notification
          const notifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
          notifs.unshift({
            id: Date.now(),
            type: 'contract_signed',
            text: `✍️ ${publicContract.clientFullName || publicContract.client} assinou o contrato "${publicContract.title}" digitalmente!`,
            time: 'Agora mesmo',
            read: false,
            contractId: id
          });
          localStorage.setItem('admin_notifications', JSON.stringify(notifs));
        }}
      />
    );
  }

  // If viewing a public proposal
  if (publicProposal) {
    return (
      <PublicProposalViewer
        proposal={publicProposal}
        onApprove={(id) => {
          // Build the fully approved proposal object using the full publicProposal data (all fields intact)
          const approvedFull: Proposal = { ...publicProposal, status: 'Aprovada' as const };

          // Persist to localStorage — merge with existing, preserving all fields from the full proposal
          const stored = localStorage.getItem('proposals_db') || '[]';
          const allProposals: Proposal[] = JSON.parse(stored);
          const exists = allProposals.find(p => p.id.toString() === id.toString());
          const updated = exists
            ? allProposals.map((p: Proposal) =>
              p.id.toString() === id.toString() ? { ...p, ...approvedFull } : p
            )
            : [...allProposals, approvedFull];
          localStorage.setItem('proposals_db', JSON.stringify(updated));

          // Create admin notification
          const existingNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
          existingNotifs.unshift({
            id: Date.now(),
            type: 'proposal_approved',
            text: `🎉 ${publicProposal.client} aprovou a proposta "${publicProposal.title}"! Pronto para gerar o contrato.`,
            time: 'Agora mesmo',
            read: false,
            proposalId: id
          });
          localStorage.setItem('admin_notifications', JSON.stringify(existingNotifs));
        }}
      />
    );
  }

  // Se estiver autenticado, renderiza o Dashboard em vez do site
  if (isAuthenticated) {
    return (
      <AdminDashboard
        onLogout={async () => {
          await supabase.auth.signOut();
          setIsAuthenticated(false);
        }}
        leads={leads}
        setLeads={setLeads}
      />
    );
  }

  return (
    <>
      <style>{`
        /* Importação de uma fonte Sans-Serif moderna e ousada (Bold/Tech) */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&display=swap');

        :root {
          --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
          --ease-in-out-circ: cubic-bezier(0.85, 0, 0.15, 1);
        }

        /* --- ANIMAÇÃO DA ASSINATURA --- */
        .signature-svg {
          width: 100%;
          max-width: 1000px;
          overflow: visible;
        }

        .sig-text {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: clamp(3rem, 8vw, 7rem);
          letter-spacing: -0.04em;
          fill: transparent;
          stroke: #d6ff00;
          stroke-width: 3px;
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .drawing .sig-text {
          /* Anima o traço primeiro, depois preenche a cor */
          animation: 
            drawSignature 2.5s ease-in-out forwards,
            fillSignature 1s 2.2s ease-in-out forwards;
        }

        @media (max-width: 768px) {
          .sig-text {
            font-size: clamp(5rem, 15vw, 8rem);
            stroke-width: 2px;
          }
          .sig-subtitle {
            font-size: 22px;
            letter-spacing: 0.15em;
          }
        }

        @keyframes drawSignature {
          100% { stroke-dashoffset: 0; }
        }

        @keyframes fillSignature {
          0% { fill: transparent; stroke-width: 3px; }
          100% { fill: #d6ff00; stroke-width: 0px; }
        }

        /* --- SUBTÍTULO DA ASSINATURA --- */
        .sig-subtitle {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.3em;
          fill: #8da2ff; /* Azul claro suave para dar contraste */
          opacity: 0;
        }

        .drawing .sig-subtitle {
          /* Aparece suavemente logo após o preenchimento do nome */
          animation: fadeSlideUp 1s 2.5s ease-out forwards;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- ANIMAÇÕES DO SITE PRINCIPAL --- */
        .mask-container {
          overflow: hidden;
          display: inline-block;
          vertical-align: top;
        }
        .mask-element {
          transform: translateY(110%) rotate(3deg);
          opacity: 0;
        }
        .ready .mask-element {
          animation: maskReveal 1.2s var(--ease-out-expo) forwards;
        }
        @keyframes maskReveal {
          to { transform: translateY(0) rotate(0deg); opacity: 1; }
        }

        .image-reveal-container {
          clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
        }
        .ready .image-reveal-container {
          animation: imageCurtain 1.5s var(--ease-in-out-circ) forwards;
        }
        @keyframes imageCurtain {
          to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
        }

        .image-zoom {
          transform: scale(1.3);
        }
        .ready .image-zoom {
          animation: scaleDown 2s var(--ease-out-expo) forwards;
        }
        @keyframes scaleDown {
          to { transform: scale(1); }
        }

        .fade-scale {
          opacity: 0;
          transform: scale(0.8) translateY(20px);
        }
        .ready .fade-scale {
          animation: fadeScaleIn 1s var(--ease-out-expo) forwards;
        }
        @keyframes fadeScaleIn {
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .draw-line {
          stroke-dasharray: 0 100;
          opacity: 0;
        }
        .ready .draw-line {
          animation: drawSVG 1.5s var(--ease-out-expo) forwards;
        }
        @keyframes drawSVG {
          to { stroke-dasharray: 100 0; opacity: 1; }
        }

        .float-subtle {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50% { transform: translateY(-12px) rotate(-1deg); }
        }

        .d-100 { animation-delay: 100ms !important; }
        .d-200 { animation-delay: 200ms !important; }
        .d-300 { animation-delay: 300ms !important; }
        .d-400 { animation-delay: 400ms !important; }
        .d-500 { animation-delay: 500ms !important; }
        .d-600 { animation-delay: 600ms !important; }
        .d-800 { animation-delay: 800ms !important; }
        .d-1000 { animation-delay: 1000ms !important; }
      `}</style>

      {/* --- PRE-LOADER (ASSINATURA) --- */}
      <div
        className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#0d34e0] transition-transform duration-[1.2s] ease-[cubic-bezier(0.85,0,0.15,1)] ${
          introStage === 'transitioning' || introStage === 'ready' ? '-translate-y-full pointer-events-none' : 'translate-y-0'
        } ${introStage === 'drawing' ? 'drawing' : ''}`}
      >
        <svg
          viewBox="0 0 1000 300"
          className="signature-svg px-4"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Nome Principal */}
          <text
            x="50%"
            y="130"
            textAnchor="middle"
            dominantBaseline="central"
            className="sig-text"
          >
            Elizabeth Celina.
          </text>

          {/* Subtítulo (Área de atuação) */}
          <text
            x="50%"
            y="210"
            textAnchor="middle"
            dominantBaseline="central"
            className="sig-subtitle"
          >
            SOCIAL MEDIA • FUNIS • SISTEMAS
          </text>
        </svg>
      </div>

      <div className={`min-h-screen bg-brand-white text-brand-black selection:bg-brand-lime selection:text-brand-blue relative transition-all duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${introStage === 'drawing' ? 'scale-[0.95] opacity-50 blur-sm' : 'scale-100 opacity-100 blur-0'
        } ${introStage === 'ready' ? 'ready' : ''}`}>
        <Navbar onOpenAdmin={() => setShowAdminLogin(true)} />
        <main>
          <Hero />
          <About />
          <Services />
          <Process />
          <Work />
          <Results />
          <Testimonials />
        </main>
        <Contact 
          onNewLead={handleNewLeadFromContact} 
          onOpenAdmin={() => setShowAdminLogin(true)} 
        />

        {/* Replay intro animation debug button for dev */}
        {introStage === 'ready' && (
          <button
            onClick={() => setIntroStage('drawing')}
            className="fixed bottom-6 right-6 bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white px-3 py-2 rounded-full text-xs font-semibold transition-all z-50 flex items-center gap-2 opacity-50 hover:opacity-100"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Rever Intro
          </button>
        )}


      </div>

      {/* Admin Login Modal - Rendered outside the blurred container */}
      {showAdminLogin && (
        <AdminLogin
          onClose={() => setShowAdminLogin(false)}
          onLoginSuccess={() => {
            setShowAdminLogin(false);
            setIsAuthenticated(true);
          }}
        />
      )}
    </>
  );
}

export default App;