# Trabalho Prático Sistemas Distribuídos UFSC 

Clinte-Servidor com implemetação de ferramentas da matéria em questão.

## Algoritmos Implementados
### Exclusão Mútua

Exclusão mútua (também conhecida pelo acrônimo mutex para mutual exclusion, o termo em inglês) é uma técnica usada em programação concorrente para evitar que dois processos ou threads tenham acesso simultaneamente a um recurso compartilhado, acesso esse denominado por seção crítica.

Um meio simples para exclusão mútua é a utilização de um semáforo binário, isto é, que só pode assumir dois valores distintos, 0 e 1. O travamento por semáforo deve ser feito antes de utilizar o recurso, e após o uso o recurso deve ser liberado. Enquanto o recurso estiver em uso, qualquer outro processo que o utilize deve esperar a liberação.

Porém, essa técnica pode causar vários efeitos colaterais, como deadlocks, em que dois processos obtêm o mesmo semáforo e ficam esperando indefinidamente um outro processo liberar o semáforo; e inanição, que é quando o processo nunca dispõe de recursos suficientes para executar plenamente. [Wikipédia](https://pt.wikipedia.org/wiki/Exclus%C3%A3o_m%C3%BAtua)

## Esquema

![alt text](https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1#G1QOefpwYBtgB05wIfZFSQi_QPMOH2UWd8)

## Instalação

```sheel 
Python3 required
NODEJS required
```

## Node Package Manager NPM



```sheel 
npm install express
npm install body-parser
npm install axios
npm install sqlite3
node server.js
```

## Navegador

Abra o seguinte link em seu navegador: [link](localhost:3000)