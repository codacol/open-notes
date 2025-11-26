
import { Language } from './types';

interface Translation {
  app_name: string;
  welcome: string;
  welcome_subtitle: string;
  login: string;
  signup: string;
  email: string;
  password: string;
  name: string;
  login_button: string;
  signup_button: string;
  have_account: string;
  no_account: string;
  create: string;
  processing: string;
  all_notes: string;
  my_personal: string;
  shared_with_me: string;
  logout: string;
  input_placeholder: string;
  no_notes_title: string;
  no_notes_desc: string;
  action_items: string;
  share_note: string;
  delete_note: string;
  edit_note: string;
  save: string;
  cancel: string;
  share_with: string;
  current_user: string;
  suggested_prompts: string[];
  auth_error_fill: string;
  auth_error_invalid: string;
  auth_error_exists: string;
  search_placeholder: string;
  sort_by: string;
  sort_newest: string;
  sort_oldest: string;
  sort_updated: string;
  filter_tags: string;
  write: string;
  preview: string;
  // Types / Folders
  types: string;
  create_type: string;
  delete_type: string;
  type_name_placeholder: string;
  move_to_type: string;
  no_type: string;
  confirm_delete_type: string;
}

export const translations: Record<Language, Translation> = {
  en: {
    app_name: "Codacol Notes",
    welcome: "Welcome back",
    welcome_subtitle: "Here's what's on your mind today.",
    login: "Log In",
    signup: "Sign Up",
    email: "Email Address",
    password: "Password",
    name: "Full Name",
    login_button: "Sign In",
    signup_button: "Create Account",
    have_account: "Already have an account?",
    no_account: "Don't have an account?",
    create: "Create",
    processing: "Processing",
    all_notes: "All Notes",
    my_personal: "My Personal",
    shared_with_me: "Shared with me",
    logout: "Log Out",
    input_placeholder: "Describe your note... (e.g. 'Plan a meeting for Friday')",
    no_notes_title: "No notes here",
    no_notes_desc: "Create a note or select a different category.",
    action_items: "Action Items",
    share_note: "Share note",
    delete_note: "Delete note",
    edit_note: "Edit note",
    save: "Save",
    cancel: "Cancel",
    share_with: "Share with...",
    current_user: "Current User",
    suggested_prompts: [
      "Plan a surprise birthday party for mom next Saturday.",
      "Meeting notes: Discussed Q3 roadmap and new designs.",
      "Grocery list: milk, eggs, spinach, and chicken.",
      "Idea for a blog post about the benefits of meditation."
    ],
    auth_error_fill: "Please fill in all fields",
    auth_error_invalid: "Invalid email or password",
    auth_error_exists: "Email already exists",
    search_placeholder: "Search notes...",
    sort_by: "Sort by",
    sort_newest: "Newest First",
    sort_oldest: "Oldest First",
    sort_updated: "Recently Updated",
    filter_tags: "Filter by tag",
    write: "Write",
    preview: "Preview",
    types: "Folders",
    create_type: "New Folder",
    delete_type: "Delete Folder",
    type_name_placeholder: "Folder Name",
    move_to_type: "Move to Folder",
    no_type: "Uncategorized",
    confirm_delete_type: "Are you sure you want to delete this folder? Notes inside will be uncategorized."
  },
  pt: {
    app_name: "Codacol Notes",
    welcome: "Bem-vindo de volta",
    welcome_subtitle: "Aqui está o que você tem em mente hoje.",
    login: "Entrar",
    signup: "Cadastrar",
    email: "Endereço de Email",
    password: "Senha",
    name: "Nome Completo",
    login_button: "Entrar",
    signup_button: "Criar Conta",
    have_account: "Já tem uma conta?",
    no_account: "Não tem uma conta?",
    create: "Criar",
    processing: "Processando",
    all_notes: "Todas as Notas",
    my_personal: "Pessoais",
    shared_with_me: "Compartilhadas",
    logout: "Sair",
    input_placeholder: "Descreva sua nota... (ex: 'Planejar reunião para sexta')",
    no_notes_title: "Nenhuma nota aqui",
    no_notes_desc: "Crie uma nota ou selecione uma categoria diferente.",
    action_items: "Itens de Ação",
    share_note: "Compartilhar nota",
    delete_note: "Excluir nota",
    edit_note: "Editar nota",
    save: "Salvar",
    cancel: "Cancelar",
    share_with: "Compartilhar com...",
    current_user: "Usuário Atual",
    suggested_prompts: [
      "Planejar festa surpresa de aniversário para mãe no sábado.",
      "Notas da reunião: Discutir roadmap do Q3 e novos designs.",
      "Lista de compras: leite, ovos, espinafre e frango.",
      "Ideia para um post no blog sobre meditação."
    ],
    auth_error_fill: "Por favor preencha todos os campos",
    auth_error_invalid: "Email ou senha inválidos",
    auth_error_exists: "Email já cadastrado",
    search_placeholder: "Pesquisar notas...",
    sort_by: "Ordenar por",
    sort_newest: "Mais Recentes",
    sort_oldest: "Mais Antigos",
    sort_updated: "Recém Atualizados",
    filter_tags: "Filtrar por tag",
    write: "Escrever",
    preview: "Visualizar",
    types: "Pastas",
    create_type: "Nova Pasta",
    delete_type: "Excluir Pasta",
    type_name_placeholder: "Nome da Pasta",
    move_to_type: "Mover para Pasta",
    no_type: "Sem Categoria",
    confirm_delete_type: "Tem certeza que deseja excluir esta pasta? As notas ficarão sem categoria."
  },
  es: {
    app_name: "Codacol Notes",
    welcome: "Bienvenido de nuevo",
    welcome_subtitle: "Esto es lo que tienes en mente hoy.",
    login: "Iniciar Sesión",
    signup: "Registrarse",
    email: "Correo Electrónico",
    password: "Contraseña",
    name: "Nombre Completo",
    login_button: "Entrar",
    signup_button: "Crear Cuenta",
    have_account: "¿Ya tienes cuenta?",
    no_account: "¿No tienes cuenta?",
    create: "Crear",
    processing: "Procesando",
    all_notes: "Todas las Notas",
    my_personal: "Personales",
    shared_with_me: "Compartidas",
    logout: "Cerrar Sesión",
    input_placeholder: "Describe tu nota... (ej: 'Planear reunión para el viernes')",
    no_notes_title: "No hay notas aquí",
    no_notes_desc: "Crea una nota o selecciona una categoría diferente.",
    action_items: "Acciones",
    share_note: "Compartir nota",
    delete_note: "Eliminar nota",
    edit_note: "Editar nota",
    save: "Guardar",
    cancel: "Cancelar",
    share_with: "Compartir con...",
    current_user: "Usuario Actual",
    suggested_prompts: [
      "Planear fiesta sorpresa de cumpleaños para mamá el sábado.",
      "Notas de reunión: Discutir roadmap del Q3 y nuevos diseños.",
      "Lista de compras: leche, huevos, espinacas y pollo.",
      "Idea para un blog post sobre los beneficios de la meditación."
    ],
    auth_error_fill: "Por favor completa todos los campos",
    auth_error_invalid: "Correo o contraseña inválidos",
    auth_error_exists: "El correo ya existe",
    search_placeholder: "Buscar notas...",
    sort_by: "Ordenar por",
    sort_newest: "Más Recientes",
    sort_oldest: "Más Antiguos",
    sort_updated: "Recién Actualizados",
    filter_tags: "Filtrar por etiqueta",
    write: "Escribir",
    preview: "Vista Previa",
    types: "Carpetas",
    create_type: "Nueva Carpeta",
    delete_type: "Eliminar Carpeta",
    type_name_placeholder: "Nombre de Carpeta",
    move_to_type: "Mover a Carpeta",
    no_type: "Sin Categoría",
    confirm_delete_type: "¿Seguro que quieres eliminar esta carpeta? Las notas quedarán sin categoría."
  }
};
