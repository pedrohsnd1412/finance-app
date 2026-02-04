export const BANK_LOGOS: Record<string, any> = {
    'Nubank': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Nubank_logo_2021.svg',
    'Itaú': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Itau_Unibanco_logo.svg',
    'Bradesco': 'https://logo.clearbit.com/bradesco.com.br',
    'Banco do Brasil': 'https://logo.clearbit.com/bb.com.br',
    'Santander': 'https://logo.clearbit.com/santander.com.br',
    'Inter': 'https://logo.clearbit.com/bancointer.com.br',
    'XP': 'https://logo.clearbit.com/xpi.com.br',
    'BTG Pactual': 'https://logo.clearbit.com/btgpactual.com',
    'Caixa': 'https://logo.clearbit.com/caixa.gov.br',
};

export const getBankLogo = (connectorName: string) => {
    return BANK_LOGOS[connectorName] || `https://ui-avatars.com/api/?name=${connectorName}&background=random`;
};
