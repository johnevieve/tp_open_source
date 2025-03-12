export function renderCommits(extraData: any): string {
  console.log("Données reçues pour les commits :", JSON.stringify(extraData));

  return `
    <h2>Liste des Commits</h2>
    <p>Afficher l'historique des commits et leurs détails.</p>
    <script>
    </script>
  `;
}
