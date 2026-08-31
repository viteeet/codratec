import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Privacidade',
  description: 'Política de privacidade da CODRATEC.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-slate-500 hover:text-secondary transition-colors text-sm mb-8"
          >
            ← Voltar ao início
          </Link>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
            Política de Privacidade
          </h1>
          <p className="text-slate-500 text-sm mb-10">
            Última atualização: fevereiro de 2026
          </p>

          <div className="prose prose-gray max-w-none space-y-6 text-slate-600">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">1. Responsável</h2>
              <p>
                A CODRATEC («nós», «nosso») é uma software house independente de desenvolvimento de software.
                Esta política descreve como tratamos informações no site codratec.com e no contato por e-mail, WhatsApp ou telefone.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">2. Dados que podemos receber</h2>
              <p>
                Ao entrar em contato por WhatsApp, e-mail ou telefone, você pode nos fornecer nome, e-mail, número de telefone e conteúdo da mensagem. 
                Esses dados são usados apenas para responder ao seu contato e, se for o caso, para prestação de serviços combinados.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">3. Uso dos dados</h2>
              <p>
                Utilizamos os dados de contato exclusivamente para: responder suas mensagens, enviar propostas ou informações solicitadas e, quando aplicável, para a execução de projetos ou contratos. 
                Não vendemos nem compartilhamos seus dados com terceiros para marketing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">4. Cookies e tecnologias do site</h2>
              <p>
                O site pode utilizar cookies ou armazenamento local (por exemplo, para lembrar o idioma escolhido). 
                Você pode ajustar as preferências do seu navegador para limitar ou bloquear cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">5. Seus direitos</h2>
              <p>
                Você pode solicitar acesso, correção ou exclusão dos dados que nos forneceu, entrando em contato pelo e-mail ou WhatsApp indicados no site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">6. Alterações</h2>
              <p>
                Podemos atualizar esta política periodicamente. A data da última atualização será indicada no topo da página.
              </p>
            </section>

            <p className="text-slate-500 text-sm pt-6 border-t border-primary/20">
              Em caso de dúvidas sobre esta política, entre em contato: victor@codratec.com.br ou +55 21 983573881.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
