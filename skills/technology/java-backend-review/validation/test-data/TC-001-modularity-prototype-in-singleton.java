package com.example.testfixtures.modularity;

public class PrototypeBean {}

// Violation: Prototype bean injected directly into Singleton bean
public class PrototypeInSingletonViolation {
    private PrototypeBean prototypeBean;

    public PrototypeInSingletonViolation(PrototypeBean prototypeBean) {
        this.prototypeBean = prototypeBean;
    }

    public void execute() {
        System.out.println(prototypeBean.toString());
    }
}

public interface ObjectProvider<T> {
    T getObject();
}

// Safe Counterpart: ObjectProvider used to fetch prototype dynamically
public class SafeObjectProviderPattern {
    private ObjectProvider<PrototypeBean> prototypeProvider;

    public SafeObjectProviderPattern(ObjectProvider<PrototypeBean> prototypeProvider) {
        this.prototypeProvider = prototypeProvider;
    }

    public void execute() {
        PrototypeBean bean = prototypeProvider.getObject();
        System.out.println(bean.toString());
    }
}

