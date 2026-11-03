// Observer (Subject.py, Observer.py no original): eventos de teclado e botões são
// repassados a todos os observadores registrados.
export class Subject {
  constructor() { this.observers = []; }
  addObserver(o) { if (!this.observers.includes(o)) this.observers.push(o); }
  removeObserver(o) { this.observers = this.observers.filter((x) => x !== o); }
  notifyObservers(event) { this.observers.forEach((o) => o.update(event)); }
}
export class Observer { update() { throw new Error('abstrato'); } }
