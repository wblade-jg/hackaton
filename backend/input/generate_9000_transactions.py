from pathlib import Path

output_path = Path(__file__).with_name('transactions_31072026.csv')

with output_path.open('w', encoding='utf-8', newline='') as f:
    f.write('Cuenta,Monto,Fecha\n')
    for i in range(1, 9001):
        account = f'{1000000000 + i}'
        amount = 100 + (i % 500)
        f.write(f'{account},{amount:.2f},31/07/2026\n')

print(f'Archivo generado: {output_path}')
