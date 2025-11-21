
import { Difficulty, Lab, LabType } from './types';

export const APP_NAME = "CyberLabs";
export const MOCK_DELAY_MS = 600;

// Placeholder images
export const THUMBNAIL_BASE = "https://picsum.photos/400/225?random=";
export const AVATAR_BASE = "https://picsum.photos/100/100?random=";

// --- Ranking System ---
export const RANK_SYSTEM = [
  { title: "Script Kiddie", minScore: 0 },
  { title: "Neophyte", minScore: 500 },
  { title: "Apprentice", minScore: 1500 },
  { title: "Pentester Jr", minScore: 3000 },
  { title: "Cyber Operative", minScore: 5000 },
  { title: "White Hat", minScore: 8000 },
  { title: "Elite Hacker", minScore: 12000 },
  { title: "Red Team Lead", minScore: 20000 }
];

// --- Shared Scenarios (Reuse environments for multiple labs) ---

const SCENARIO_LINUX = {
  fileSystem: {
    'notes.txt': 'Bem-vindo ao Linux. Comandos básicos são essenciais.',
    'perms.txt': 'Apenas root pode escrever aqui.',
    '.hidden_conf': 'CONFIDENCIAL: porta=8080',
    'access.log': '192.168.1.1 - - [10/Oct/2023:13:55:36] "GET / HTTP/1.1" 200',
    '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash',
    '/var/www/html/index.html': '<h1>Site em Manutenção</h1>',
    'script.sh': '#!/bin/bash\necho "Olá Hacker"',
    'network_map.png': '[Binary Data]',
    '/tmp/flag.txt': 'THM{LINUX_BASICS_DONE}'
  },
  network: {
    'whoami': 'user',
    'pwd': '/home/user',
    'id': 'uid=1000(user) gid=1000(user) groups=1000(user)',
    'ls': 'notes.txt  perms.txt  script.sh  access.log',
    'ls -la': 'drwxr-xr-x user user . \n-rw-r--r-- user user notes.txt\n-rw-r--r-- user user .hidden_conf\n-rw-r--r-- user user perms.txt',
    'cat notes.txt': 'Bem-vindo ao Linux. Comandos básicos são essenciais.',
    'cat .hidden_conf': 'CONFIDENCIAL: porta=8080',
    'grep "GET" access.log': '192.168.1.1 - - [10/Oct/2023:13:55:36] "GET / HTTP/1.1" 200',
    'chmod +x script.sh': 'Modo de script.sh alterado para 755',
    './script.sh': 'Olá Hacker',
    'ps aux': 'root 1 0.0 0.1 /sbin/init\nuser 1042 0.0 0.1 /bin/bash',
    'cat /tmp/flag.txt': 'THM{LINUX_BASICS_DONE}'
  }
};

const SCENARIO_NETWORK = {
  fileSystem: {
    'hosts.txt': '192.168.1.1 gateway\n192.168.1.10 target-server',
    'nmap-scan.txt': 'Scan saved.'
  },
  network: {
    'ping 192.168.1.10': '64 bytes from 192.168.1.10: icmp_seq=1 ttl=64 time=0.045 ms',
    'ifconfig': 'eth0: inet 192.168.1.5 netmask 255.255.255.0',
    'ip addr': 'eth0: inet 192.168.1.5/24',
    'nmap 192.168.1.10': 'PORT   STATE SERVICE\n22/tcp open  ssh\n80/tcp open  http\n3306/tcp open mysql',
    'nmap -sV 192.168.1.10': 'PORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 7.6p1\n80/tcp open  http    Apache 2.4.29',
    'nc 192.168.1.10 80': 'GET / HTTP/1.1\nHTTP/1.1 200 OK\nServer: Apache\n\n<html>Hello</html>',
    'curl http://192.168.1.10': '<html><body><h1>Corp Intranet</h1></body></html>'
  }
};

const SCENARIO_WEB = {
  fileSystem: {
    'wordlist.txt': 'admin\nlogin\nbackup\nupload',
    'cookie_stealer.py': 'print("Stealing...")'
  },
  network: {
    'curl http://10.10.10.5': '<html><!-- TODO: /admin-portal --></html>',
    'curl http://10.10.10.5/admin-portal': '403 Forbidden',
    'curl http://10.10.10.5/robots.txt': 'User-agent: *\nDisallow: /secret-upload/',
    'gobuster dir -u http://10.10.10.5 -w wordlist.txt': '/admin (Status: 403)\n/login (Status: 200)\n/backup (Status: 301)',
    'curl -H "Cookie: admin=true" http://10.10.10.5/admin-portal': '<h1>Admin Panel</h1> Flag: THM{WEB_MASTER_2024}',
    'sqlmap -u "http://10.10.10.5/search?q=test"': '[+] Table: users\n[+] Columns: id, username, password',
    'alert("XSS")': 'XSS Triggered!'
  }
};

const SCENARIO_PRIVESC = {
  fileSystem: {
    'suid_binary': '[BINARY]',
    '/etc/shadow': 'Permission denied',
    '/home/user/flag.txt': 'THM{USER_FLAG}',
    '/root/root.txt': 'Permission denied'
  },
  network: {
    'whoami': 'user',
    'sudo -l': 'User may run the following commands on host: (root) NOPASSWD: /usr/bin/vim',
    'find / -perm -u=s': '/usr/bin/passwd\n/usr/bin/su\n/bin/mount\n/usr/bin/systemctl',
    'sudo /usr/bin/vim -c ":!/bin/sh"': '# whoami\nroot\n# cat /root/root.txt\nTHM{ROOT_ACCESS_GRANTED}',
    'cat /etc/crontab': '* * * * * root /opt/backup.sh'
  }
};

// Map Lab IDs to scenarios
export const LAB_SCENARIOS: Record<number, any> = {};

// Helper to assign scenarios to ranges
const assignScenario = (ids: number[], scenario: any) => {
  ids.forEach(id => LAB_SCENARIOS[id] = scenario);
};

// 1-6: Linux (Basic)
assignScenario([1,2,3,4,5,6], SCENARIO_LINUX);
// 7-12: Networking (Recon)
assignScenario([7,8,9,10,11,12], SCENARIO_NETWORK);
// 13-18: Web
assignScenario([13,14,15,16,17,18], SCENARIO_WEB);
// 19-24: Exploitation (Mixed)
assignScenario([19,20,21,22,23,24], SCENARIO_WEB); // Reusing web for exploit examples
// 25-30: PrivEsc
assignScenario([25,26,27,28,29,30], SCENARIO_PRIVESC);


// --- THE 30 EXERCISES ---

export const INITIAL_LABS: Lab[] = [
  // --- MÓDULO 1: FUNDAMENTOS DE LINUX E SISTEMAS ---
  {
    id: 1,
    module: "Módulo 1: Fundamentos",
    slug: 'linux-basics-1',
    title: 'Linux I: Navegação e Arquivos',
    description: 'Aprenda a navegar no terminal, listar arquivos e ler conteúdos. O básico essencial para qualquer hacker.',
    points: 100,
    difficulty: Difficulty.EASY,
    type: LabType.WALKTHROUGH,
    tags: ['Linux', 'Basics'],
    thumbnail: `${THUMBNAIL_BASE}1`,
    steps: [
      { id: 1, title: 'Quem sou eu?', content: 'Descubra seu usuário atual.\nComando: `whoami`', question: 'Qual o nome do usuário?', answer: 'user' },
      { id: 2, title: 'Listando Arquivos', content: 'Liste os arquivos no diretório atual.\nComando: `ls`', question: 'Qual arquivo de texto (.txt) está visível?', answer: 'notes.txt' },
      { id: 3, title: 'Lendo Conteúdo', content: 'Leia o conteúdo do arquivo de notas.\nComando: `cat notes.txt`', question: 'Qual a última palavra do conteúdo?', answer: 'essenciais.' }
    ]
  },
  {
    id: 2,
    module: "Módulo 1: Fundamentos",
    slug: 'linux-basics-2',
    title: 'Linux II: Permissões e Ocultos',
    description: 'Arquivos ocultos e permissões de execução. Entenda como o Linux protege (ou esconde) dados.',
    points: 150,
    difficulty: Difficulty.EASY,
    type: LabType.WALKTHROUGH,
    tags: ['Linux', 'Permissions'],
    thumbnail: `${THUMBNAIL_BASE}2`,
    steps: [
      { id: 1, title: 'Arquivos Ocultos', content: 'Use `ls -la` para ver arquivos que começam com ponto.', question: 'Qual o nome do arquivo de configuração oculto?', answer: '.hidden_conf' },
      { id: 2, title: 'Lendo Segredos', content: 'Leia o arquivo oculto encontrado.', question: 'Qual a porta configurada?', answer: '8080' },
      { id: 3, title: 'Executando Scripts', content: 'Tente rodar `./script.sh`. Se falhar, dê permissão com `chmod +x script.sh` e tente novamente.', question: 'Qual a mensagem exibida?', answer: 'Olá Hacker' }
    ]
  },
  {
    id: 3,
    module: "Módulo 1: Fundamentos",
    slug: 'linux-grep',
    title: 'Linux III: Filtragem com Grep',
    description: 'Encontre agulhas no palheiro. Use o grep para analisar logs e encontrar padrões.',
    points: 150,
    difficulty: Difficulty.EASY,
    type: LabType.CTF,
    tags: ['Linux', 'Grep'],
    thumbnail: `${THUMBNAIL_BASE}3`,
    steps: [
      { id: 1, title: 'Análise de Logs', content: 'O arquivo `access.log` contém registros de acesso. Use `cat` para vê-lo.', question: 'Qual o IP registrado?', answer: '192.168.1.1' },
      { id: 2, title: 'Filtrando GET', content: 'Use `grep "GET" access.log` para ver apenas requisições GET.', question: 'Qual o código de status HTTP retornado?', answer: '200' }
    ]
  },
  {
    id: 4,
    module: "Módulo 1: Fundamentos",
    slug: 'linux-processes',
    title: 'Linux IV: Gerenciamento de Processos',
    description: 'Identifique processos rodando no sistema.',
    points: 200,
    difficulty: Difficulty.MEDIUM,
    type: LabType.WALKTHROUGH,
    tags: ['Linux', 'Process'],
    thumbnail: `${THUMBNAIL_BASE}4`,
    steps: [
      { id: 1, title: 'Listar Processos', content: 'Use `ps aux` para ver todos os processos.', question: 'Qual o PID do processo /bin/bash?', answer: '1042' }
    ]
  },
  {
    id: 5,
    module: "Módulo 1: Fundamentos",
    slug: 'linux-users',
    title: 'Linux V: Usuários e Grupos',
    description: 'Entenda o arquivo /etc/passwd e identificação de usuários.',
    points: 200,
    difficulty: Difficulty.EASY,
    type: LabType.WALKTHROUGH,
    tags: ['Linux', 'Admin'],
    thumbnail: `${THUMBNAIL_BASE}5`,
    steps: [
      { id: 1, title: 'Identidade', content: 'Use o comando `id` para ver seus grupos.', question: 'Qual o gid do usuário?', answer: '1000' },
      { id: 2, title: 'Arquivo de Usuários', content: 'Leia o arquivo `/etc/passwd` para ver os usuários do sistema.', question: 'Qual o shell padrão do usuário root?', answer: '/bin/bash' }
    ]
  },
  {
    id: 6,
    module: "Módulo 1: Fundamentos",
    slug: 'linux-challenge-1',
    title: 'Desafio Linux: O Tesouro',
    description: 'Combine seus conhecimentos para encontrar a flag escondida no sistema de arquivos temporário.',
    points: 300,
    difficulty: Difficulty.MEDIUM,
    type: LabType.CTF,
    tags: ['Linux', 'Challenge'],
    thumbnail: `${THUMBNAIL_BASE}6`,
    steps: [
      { id: 1, title: 'Encontre a Flag', content: 'A flag está localizada no diretório `/tmp`. Liste e leia o arquivo.', question: 'Qual é a flag?', answer: 'THM{LINUX_BASICS_DONE}' }
    ]
  },

  // --- MÓDULO 2: RECONHECIMENTO E REDES ---
  {
    id: 7,
    module: "Módulo 2: Reconhecimento",
    slug: 'net-ping',
    title: 'Network I: Conectividade',
    description: 'O básico de redes. Verifique se o alvo está online.',
    points: 100,
    difficulty: Difficulty.EASY,
    type: LabType.WALKTHROUGH,
    tags: ['Network', 'Ping'],
    thumbnail: `${THUMBNAIL_BASE}7`,
    steps: [
      { id: 1, title: 'Ping', content: 'Verifique se o servidor `192.168.1.10` está ativo.\nComando: `ping 192.168.1.10`', question: 'Qual o tamanho (bytes) do pacote enviado?', answer: '64' }
    ]
  },
  {
    id: 8,
    module: "Módulo 2: Reconhecimento",
    slug: 'net-ifconfig',
    title: 'Network II: Interfaces',
    description: 'Descubra seu próprio endereço IP e configurações de rede.',
    points: 100,
    difficulty: Difficulty.EASY,
    type: LabType.WALKTHROUGH,
    tags: ['Network'],
    thumbnail: `${THUMBNAIL_BASE}8`,
    steps: [
      { id: 1, title: 'Meu IP', content: 'Use `ifconfig` ou `ip addr` para ver suas interfaces.', question: 'Qual o seu IP na interface eth0?', answer: '192.168.1.5' }
    ]
  },
  {
    id: 9,
    module: "Módulo 2: Reconhecimento",
    slug: 'nmap-basic',
    title: 'Nmap I: Escaneamento de Portas',
    description: 'Descubra portas abertas no servidor alvo.',
    points: 200,
    difficulty: Difficulty.MEDIUM,
    type: LabType.WALKTHROUGH,
    tags: ['Nmap', 'Recon'],
    thumbnail: `${THUMBNAIL_BASE}9`,
    steps: [
      { id: 1, title: 'Scan Simples', content: 'Use `nmap 192.168.1.10` para ver portas abertas.', question: 'Qual porta TCP alta (acima de 1000) está aberta?', answer: '3306' }
    ]
  },
  {
    id: 10,
    module: "Módulo 2: Reconhecimento",
    slug: 'nmap-services',
    title: 'Nmap II: Versões de Serviços',
    description: 'Não basta saber a porta, precisamos saber o software rodando nela.',
    points: 250,
    difficulty: Difficulty.MEDIUM,
    type: LabType.WALKTHROUGH,
    tags: ['Nmap'],
    thumbnail: `${THUMBNAIL_BASE}10`,
    steps: [
      { id: 1, title: 'Service Scan', content: 'Use `nmap -sV 192.168.1.10` para detectar versões.', question: 'Qual a versão do Apache detectada?', answer: '2.4.29' }
    ]
  },
  {
    id: 11,
    module: "Módulo 2: Reconhecimento",
    slug: 'netcat-banner',
    title: 'Netcat: Banner Grabbing',
    description: 'Conecte-se manualmente às portas para capturar banners de serviço.',
    points: 300,
    difficulty: Difficulty.MEDIUM,
    type: LabType.CTF,
    tags: ['Netcat'],
    thumbnail: `${THUMBNAIL_BASE}11`,
    steps: [
      { id: 1, title: 'Conexão Direta', content: 'Use `nc 192.168.1.10 80` para conectar na porta web.', question: 'Qual o servidor reportado no cabeçalho HTTP?', answer: 'Apache' }
    ]
  },
  {
    id: 12,
    module: "Módulo 2: Reconhecimento",
    slug: 'curl-recon',
    title: 'Curl Reconnaissance',
    description: 'Interaja com servidores web via linha de comando.',
    points: 200,
    difficulty: Difficulty.EASY,
    type: LabType.WALKTHROUGH,
    tags: ['Web', 'Curl'],
    thumbnail: `${THUMBNAIL_BASE}12`,
    steps: [
      { id: 1, title: 'Fetch HTML', content: 'Baixe a página inicial: `curl http://192.168.1.10`', question: 'Qual o título da página (dentro de h1)?', answer: 'Corp Intranet' }
    ]
  },

  // --- MÓDULO 3: WEB HACKING (OWASP) ---
  {
    id: 13,
    module: "Módulo 3: Web Hacking",
    slug: 'web-robots',
    title: 'Web I: Robots.txt',
    description: 'O arquivo robots.txt frequentemente revela diretórios sensíveis.',
    points: 100,
    difficulty: Difficulty.EASY,
    type: LabType.WALKTHROUGH,
    tags: ['Web', 'Recon'],
    thumbnail: `${THUMBNAIL_BASE}13`,
    steps: [
      { id: 1, title: 'Verificando Robots', content: 'Acesse `curl http://10.10.10.5/robots.txt`.', question: 'Qual diretório de upload é "Disallow"?', answer: '/secret-upload/' }
    ]
  },
  {
    id: 14,
    module: "Módulo 3: Web Hacking",
    slug: 'web-gobuster',
    title: 'Web II: Brute Force de Diretórios',
    description: 'Descubra diretórios ocultos que não estão linkados.',
    points: 300,
    difficulty: Difficulty.MEDIUM,
    type: LabType.WALKTHROUGH,
    tags: ['Web', 'Gobuster'],
    thumbnail: `${THUMBNAIL_BASE}14`,
    steps: [
      { id: 1, title: 'Fuzzing de Dir', content: 'Use `gobuster dir -u http://10.10.10.5 -w wordlist.txt` (Simulado).', question: 'Qual diretório retornou status 403 (Forbidden)?', answer: '/admin' }
    ]
  },
  {
    id: 15,
    module: "Módulo 3: Web Hacking",
    slug: 'web-headers',
    title: 'Web III: Headers e Cookies',
    description: 'Manipule cabeçalhos HTTP para se passar por administrador.',
    points: 400,
    difficulty: Difficulty.HARD,
    type: LabType.CTF,
    tags: ['Web', 'Cookies'],
    thumbnail: `${THUMBNAIL_BASE}15`,
    steps: [
      { id: 1, title: 'Acesso Negado', content: 'Tente acessar `/admin-portal`. Retornará 403.', question: 'Qual o código de erro?', answer: '403' },
      { id: 2, title: 'Cookie Manipulation', content: 'Envie um cookie de admin: `curl -H "Cookie: admin=true" http://10.10.10.5/admin-portal`', question: 'Qual a flag retornada?', answer: 'THM{WEB_MASTER_2024}' }
    ]
  },
  {
    id: 16,
    module: "Módulo 3: Web Hacking",
    slug: 'web-sqli-basic',
    title: 'Web IV: SQL Injection Intro',
    description: 'Entenda como bancos de dados são manipulados via input.',
    points: 500,
    difficulty: Difficulty.HARD,
    type: LabType.WALKTHROUGH,
    tags: ['SQLi', 'OWASP'],
    thumbnail: `${THUMBNAIL_BASE}16`,
    steps: [
      { id: 1, title: 'Conceito', content: 'Uma injeção SQL ocorre quando input não sanitizado é executado. Exemplo: `\' OR 1=1 --`.', question: 'Qual caractere geralmente é usado para comentar o resto da query em SQL?', answer: '--' }
    ]
  },
  {
    id: 17,
    module: "Módulo 3: Web Hacking",
    slug: 'web-xss-reflected',
    title: 'Web V: XSS Refletido',
    description: 'Execute JavaScript no navegador da vítima.',
    points: 300,
    difficulty: Difficulty.MEDIUM,
    type: LabType.WALKTHROUGH,
    tags: ['XSS', 'OWASP'],
    thumbnail: `${THUMBNAIL_BASE}17`,
    steps: [
      { id: 1, title: 'Alert Box', content: 'Para provar XSS, geralmente tentamos abrir um alerta. Simule: `alert("XSS")`.', question: 'O que aparece no alerta?', answer: 'XSS Triggered!' }
    ]
  },
  {
    id: 18,
    module: "Módulo 3: Web Hacking",
    slug: 'web-challenge-ctf',
    title: 'Desafio Web: O Portal',
    description: 'Aplique o conhecimento de Recon e Headers para invadir o portal.',
    points: 600,
    difficulty: Difficulty.HARD,
    type: LabType.CTF,
    tags: ['Web', 'Challenge'],
    thumbnail: `${THUMBNAIL_BASE}18`,
    steps: [
      { id: 1, title: 'Capture a Flag', content: 'Acesse o `/admin-portal` usando a técnica de Cookie Spoofing aprendida no Lab 15.', question: 'Flag?', answer: 'THM{WEB_MASTER_2024}' }
    ]
  },

  // --- MÓDULO 4: EXPLORAÇÃO E SISTEMAS ---
  {
    id: 19,
    module: "Módulo 4: Exploração",
    slug: 'exp-bruteforce',
    title: 'Exploit I: Brute Force SSH',
    description: 'Adivinhando senhas fracas com Hydra (Conceito).',
    points: 300,
    difficulty: Difficulty.MEDIUM,
    type: LabType.WALKTHROUGH,
    tags: ['Hydra', 'SSH'],
    thumbnail: `${THUMBNAIL_BASE}19`,
    steps: [
      { id: 1, title: 'Wordlists', content: 'Brute force depende de uma boa lista de senhas. A mais famosa é a rockyou.txt.', question: 'Qual o nome da wordlist mais famosa?', answer: 'rockyou.txt' }
    ]
  },
  {
    id: 20,
    module: "Módulo 4: Exploração",
    slug: 'exp-metasploit',
    title: 'Exploit II: Intro ao Metasploit',
    description: 'Conhecendo o framework de exploração mais usado.',
    points: 200,
    difficulty: Difficulty.EASY,
    type: LabType.WALKTHROUGH,
    tags: ['Metasploit'],
    thumbnail: `${THUMBNAIL_BASE}20`,
    steps: [
      { id: 1, title: 'Console', content: 'Para iniciar o Metasploit, usamos um comando específico no terminal.', question: 'Qual comando inicia o framework?', answer: 'msfconsole' }
    ]
  },
  {
    id: 21,
    module: "Módulo 4: Exploração",
    slug: 'exp-shells',
    title: 'Exploit III: Reverse Shells',
    description: 'A diferença entre Bind Shell e Reverse Shell.',
    points: 300,
    difficulty: Difficulty.MEDIUM,
    type: LabType.WALKTHROUGH,
    tags: ['Shells', 'Netcat'],
    thumbnail: `${THUMBNAIL_BASE}21`,
    steps: [
      { id: 1, title: 'Ouvinte', content: 'No atacante, deixamos o netcat ouvindo. `nc -lvnp 4444`.', question: 'O que a flag -l significa?', answer: 'listen' }
    ]
  },
  {
    id: 22,
    module: "Módulo 4: Exploração",
    slug: 'exp-steg',
    title: 'Exploit IV: Esteganografia',
    description: 'Ocultando dados dentro de imagens.',
    points: 250,
    difficulty: Difficulty.MEDIUM,
    type: LabType.CTF,
    tags: ['Stego'],
    thumbnail: `${THUMBNAIL_BASE}22`,
    steps: [
      { id: 1, title: 'Steghide', content: 'Ferramenta comum para extrair dados de JPGs com senha.', question: 'Qual argumento extrai dados (extract)?', answer: 'sf' },
      { id: 2, title: 'Simulação', content: 'Imagine que extraiu `pass.txt` de `image.jpg`.', question: 'Onde os dados estavam?', answer: 'image.jpg' }
    ]
  },
  {
    id: 23,
    module: "Módulo 4: Exploração",
    slug: 'exp-hash',
    title: 'Exploit V: Cracking Hashes',
    description: 'Quebrando senhas criptografadas com John The Ripper.',
    points: 300,
    difficulty: Difficulty.MEDIUM,
    type: LabType.WALKTHROUGH,
    tags: ['John', 'Crypto'],
    thumbnail: `${THUMBNAIL_BASE}23`,
    steps: [
      { id: 1, title: 'Identificar Hash', content: 'Hashes que começam com $1$ geralmente são MD5.', question: 'MD5 é considerado seguro hoje? (sim/nao)', answer: 'nao' }
    ]
  },
  {
    id: 24,
    module: "Módulo 4: Exploração",
    slug: 'exp-challenge',
    title: 'Desafio Exploit: O Shell',
    description: 'Conceitual: Obtenha acesso ao sistema.',
    points: 500,
    difficulty: Difficulty.HARD,
    type: LabType.CTF,
    tags: ['Challenge'],
    thumbnail: `${THUMBNAIL_BASE}24`,
    steps: [
      { id: 1, title: 'Porta 4444', content: 'Conecte na porta 4444 que foi aberta por uma backdoor simulada. `nc 192.168.1.10 4444` (Simulado: Apenas conceito).', question: 'Qual ferramenta conecta em portas TCP cruas?', answer: 'netcat' }
    ]
  },

  // --- MÓDULO 5: PÓS-EXPLORAÇÃO E PRIVESC ---
  {
    id: 25,
    module: "Módulo 5: PrivEsc",
    slug: 'priv-sudo',
    title: 'PrivEsc I: Sudo Abusivo',
    description: 'Quando o sudo é configurado de forma insegura.',
    points: 400,
    difficulty: Difficulty.MEDIUM,
    type: LabType.WALKTHROUGH,
    tags: ['PrivEsc', 'Sudo'],
    thumbnail: `${THUMBNAIL_BASE}25`,
    steps: [
      { id: 1, title: 'Listar Permissões', content: 'Verifique o que você pode rodar como root. Comando: `sudo -l`', question: 'Qual binário pode ser rodado sem senha?', answer: '/usr/bin/vim' },
      { id: 2, title: 'Explorando Vim', content: 'O Vim pode abrir um shell. Execute `sudo /usr/bin/vim -c ":!/bin/sh"` para virar root.', question: 'Qual o usuário após o comando?', answer: 'root' },
      { id: 3, title: 'Flag Root', content: 'Agora que é root, leia `/root/root.txt`', question: 'Qual a flag?', answer: 'THM{ROOT_ACCESS_GRANTED}' }
    ]
  },
  {
    id: 26,
    module: "Módulo 5: PrivEsc",
    slug: 'priv-suid',
    title: 'PrivEsc II: Binários SUID',
    description: 'Binários que rodam com permissão de quem os criou (owner).',
    points: 400,
    difficulty: Difficulty.HARD,
    type: LabType.WALKTHROUGH,
    tags: ['PrivEsc', 'SUID'],
    thumbnail: `${THUMBNAIL_BASE}26`,
    steps: [
      { id: 1, title: 'Buscando SUID', content: 'Encontre arquivos com bit SUID: `find / -perm -u=s`', question: 'Qual binário incomum apareceu na lista (dica: system...)', answer: '/usr/bin/systemctl' }
    ]
  },
  {
    id: 27,
    module: "Módulo 5: PrivEsc",
    slug: 'priv-cron',
    title: 'PrivEsc III: Cron Jobs',
    description: 'Tarefas agendadas que rodam scripts modificáveis.',
    points: 350,
    difficulty: Difficulty.MEDIUM,
    type: LabType.WALKTHROUGH,
    tags: ['PrivEsc', 'Cron'],
    thumbnail: `${THUMBNAIL_BASE}27`,
    steps: [
      { id: 1, title: 'Verificando Crontab', content: 'Leia `/etc/crontab` para ver tarefas do sistema.', question: 'Qual script roda a cada minuto?', answer: '/opt/backup.sh' }
    ]
  },
  {
    id: 28,
    module: "Módulo 5: PrivEsc",
    slug: 'priv-kernel',
    title: 'PrivEsc IV: Kernel Exploits',
    description: 'Explorando falhas no núcleo do sistema operacional (DirtyCow, etc).',
    points: 500,
    difficulty: Difficulty.INSANE,
    type: LabType.WALKTHROUGH,
    tags: ['Kernel', 'Exploit'],
    thumbnail: `${THUMBNAIL_BASE}28`,
    steps: [
      { id: 1, title: 'Versão do Kernel', content: 'Para buscar exploits, precisamos saber a versão. Comando: `uname -a` (Conceito).', question: 'Qual comando mostra a versão do kernel?', answer: 'uname -a' }
    ]
  },
  {
    id: 29,
    module: "Módulo 5: PrivEsc",
    slug: 'priv-passwords',
    title: 'PrivEsc V: Senhas em Arquivos',
    description: 'Buscando senhas esquecidas em configs e históricos.',
    points: 200,
    difficulty: Difficulty.EASY,
    type: LabType.WALKTHROUGH,
    tags: ['Grepping'],
    thumbnail: `${THUMBNAIL_BASE}29`,
    steps: [
      { id: 1, title: 'Histórico Bash', content: 'Verifique `.bash_history` do usuário.', question: 'Qual arquivo armazena histórico de comandos?', answer: '.bash_history' }
    ]
  },
  {
    id: 30,
    module: "Módulo 5: PrivEsc",
    slug: 'priv-final-exam',
    title: 'Exame Final: The Root',
    description: 'O teste final. Combine enumeração, sudo abuse e leitura de flags.',
    points: 1000,
    difficulty: Difficulty.INSANE,
    type: LabType.CTF,
    tags: ['Exam', 'Root'],
    thumbnail: `${THUMBNAIL_BASE}30`,
    steps: [
      { id: 1, title: 'Passo 1: Enumeração', content: 'Verifique `sudo -l`.', question: 'Binário vulnerável?', answer: '/usr/bin/vim' },
      { id: 2, title: 'Passo 2: Exploração', content: 'Use o Vim para spawnar shell root.', question: 'Comando usado dentro do vim?', answer: ':!/bin/sh' },
      { id: 3, title: 'Passo 3: Loot', content: 'Pegue a flag em `/root/root.txt`.', question: 'Flag Final?', answer: 'THM{ROOT_ACCESS_GRANTED}' }
    ]
  }
];
