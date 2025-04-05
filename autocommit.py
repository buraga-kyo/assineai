import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess

class GitHandler(FileSystemEventHandler):
    def on_modified(self, event):
        # Ignorar alterações em diretórios ou arquivos dentro do diretório .git e node_modules
        if event.is_directory or '.git' in event.src_path or 'node_modules' in event.src_path:
            return 
        
        print(f'Alteração detectada em: {event.src_path}')
        self.commit_and_push()

    def commit_and_push(self): 
        try:
            # Verificar se há alterações a serem adicionadas
            status_result = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
            if not status_result.stdout.strip():
                return  # Se não houver alterações, não faz o commit

            # Adicionar alterações ao repositório
            subprocess.run(['git', 'add', '.'], check=True)
            subprocess.run(['ai-commit', '--force'], check=True)
            subprocess.run(['git', 'push'], check=True)
            print('Alterações commitadas e enviadas para o repositório remoto.') 
 
        except subprocess.CalledProcessError as e:
            print(f'Erro ao executar comando Git: {e}')

if __name__ == "__main__":
    #path = 'C:\\Users\\Dwith\\Documents\\5_PROJETOS\\ASSINE_AI\\BACKEND'  
    #path = '/home/bragaus/Documentos/AssineAi/ASSINATURA_BACKEND'  
    path = '/home/bragaus/Documentos/AssineAi/BACKEND'
    event_handler = GitHandler()
    observer = Observer()
    observer.schedule(event_handler, path=path, recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt: 
        observer.stop()       
    observer.join()
