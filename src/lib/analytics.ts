// Event Names
export const ANALYTICS_EVENTS = {
  // Page Views
  PAGE_VIEW: 'Page View',
  
  // Auth Events
  USER_SIGN_UP: 'User Sign Up',
  USER_LOGIN: 'User Login',
  USER_LOGOUT: 'User Logout',
  
  // Bet Creation Funnel
  BET_CREATION_START: 'Bet Creation Start',
  BET_CREATION_FORM_FILL: 'Bet Creation Form Fill',
  BET_CREATION_OPTION_ADD: 'Bet Creation Option Add',
  BET_CREATION_OPTION_REMOVE: 'Bet Creation Option Remove',
  BET_CREATION_VISIBILITY_CHANGE: 'Bet Creation Visibility Change',
  BET_CREATION_FORM_ABANDON: 'Bet Creation Form Abandon',
  BET_CREATION_SUBMIT: 'Bet Creation Submit',
  BET_CREATION_SUCCESS: 'Bet Creation Success',
  BET_CREATION_ERROR: 'Bet Creation Error',
  
  // Bet Interaction Funnel
  BET_VIEW: 'Bet View',
  BET_SHARE_CLICK: 'Bet Share Click',
  BET_SHARE_SUCCESS: 'Bet Share Success',
  BET_VOTE_START: 'Bet Vote Start',
  BET_VOTE_SUBMIT: 'Bet Vote Submit',
  BET_VOTE_SUCCESS: 'Bet Vote Success',
  BET_VOTE_ERROR: 'Bet Vote Error',
  
  // Bet Management
  BET_FINALIZE_START: 'Bet Finalize Start',
  BET_FINALIZE_SUBMIT: 'Bet Finalize Submit',
  BET_FINALIZE_SUCCESS: 'Bet Finalize Success',
  BET_FINALIZE_ERROR: 'Bet Finalize Error',
} as const;

// Helper function to get bet properties
export const getBetProperties = (bet: any) => ({
  betId: bet.id,
  betTitle: bet.titulo,
  betType: bet.visibilidade,
  optionsCount: bet.opcoes.length,
  betValue: bet.valor_aposta,
  creatorEmail: bet.email_criador,
  createdAt: bet.created_at,
  endDate: bet.data_fim,
  isOpen: !bet.resultado_final,
  totalVotes: bet.total_votos || 0,
  totalValue: bet.total_valor || 0,
});

// Helper function to get user properties
export const getUserProperties = (user: any) => ({
  userId: user.id,
  email: user.email,
  userCreatedAt: user.created_at,
  lastSignIn: user.last_sign_in_at,
});

// Helper function to get vote properties
export const getVoteProperties = (vote: any) => ({
  betId: vote.aposta_id,
  voterName: vote.nome_apostador,
  selectedOption: vote.opcao_escolhida,
  votedAt: vote.created_at,
}); 