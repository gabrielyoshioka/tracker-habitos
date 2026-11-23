document.querySelectorAll('.checkbox-habito').forEach(checkbox => {
    checkbox.addEventListener('change', async function () {
        const habitId = this.getAttribute('data-id');
        const hoje = new Date().toLocaleDateString('en-CA');
        const textoHabito = this.nextElementSibling;

        try {
            const response = await fetch('/habitos/checkin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ habitId, data: hoje })
            });

            const resultado = await response.json();

            if (resultado.sucesso) {
                textoHabito.classList.toggle('text-decoration-line-through', this.checked);
                textoHabito.classList.toggle('text-muted', this.checked);
                textoHabito.classList.toggle('text-dark', !this.checked);
                atualizarBarraProgressoHoje();
            }
        } catch (erro) {
            console.error('Erro ao registrar check-in:', erro);
        }
    });
});

document.querySelectorAll('.btn-editar-habito').forEach(botao => {
    botao.addEventListener('click', () => {
        const id = botao.getAttribute('data-id');
        const name = botao.getAttribute('data-name');
        const daysStr = botao.getAttribute('data-days');

        // Define a rota do formulário e preenche o nome
        document.getElementById('formEditarHabito').action = `/habitos/editar/${id}`;
        document.getElementById('editNomeHabito').value = name;

        // Limpa checkboxes anteriores e marca os dias atuais do hábito
        const diasArray = daysStr ? daysStr.split(',') : [];
        document.querySelectorAll('.edit-dia-checkbox').forEach(checkbox => {
            checkbox.checked = diasArray.includes(checkbox.value);
        });
    });
});

document.querySelectorAll('.btn-editar-rotina').forEach(botao => {
    botao.addEventListener('click', () => {
        const id = botao.getAttribute('data-id');
        const name = botao.getAttribute('data-name');
        const habitosStr = botao.getAttribute('data-habitos');

        // Define a rota do formulário e preenche o nome
        document.getElementById('formEditarRotina').action = `/rotinas/editar/${id}`;
        document.getElementById('editNomeRotina').value = name;

        // Marca os checkboxes dos hábitos que já pertencem à rotina
        const habitosArray = habitosStr ? habitosStr.split(',') : [];
        document.querySelectorAll('.edit-rotina-habito-checkbox').forEach(checkbox => {
            checkbox.checked = habitosArray.includes(checkbox.value);
        });
    });
});

function atualizarBarraProgressoHoje() {
    const checkboxes = document.querySelectorAll('.checkbox-habito');
    const barra = document.getElementById('barraProgressoHoje');
    const texto = document.getElementById('textoProgressoHoje');

    if (!barra || !texto) return;

    const total = checkboxes.length;
    const concluidos = Array.from(checkboxes).filter(cb => cb.checked).length;
    const porcentagem = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    barra.style.width = `${porcentagem}%`;
    barra.setAttribute('aria-valuenow', porcentagem);
    texto.textContent = `${concluidos}/${total} (${porcentagem}%)`;
}