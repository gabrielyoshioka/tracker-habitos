document.querySelectorAll('.checkbox-habito').forEach(checkbox => {
    checkbox.addEventListener('change', async function() {
        const habitId = this.value;
        const isChecked = this.checked;
        const data = new Date().toLocaleDateString('en-CA'); 
        const spanTexto = this.nextElementSibling;

        try {
            const response = await fetch('/habitos/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ habitId, data })
            });
            
            const result = await response.json();
            
            if (result.sucesso) {
                if (isChecked) {
                    spanTexto.classList.add('text-decoration-line-through', 'text-muted');
                } else {
                    spanTexto.classList.remove('text-decoration-line-through', 'text-muted');
                }
            } else {
                alert("Erro: " + result.erro);
                this.checked = !isChecked; 
            }
        } catch (error) {
            console.error('Erro na comunicação:', error);
            this.checked = !isChecked; 
        }
    });
});