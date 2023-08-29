export ARGO_SERVER=$(kubectl get svc -n argocd -l app.kubernetes.io/name=argocd-server -o name) 
export ARGO_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
kubectl port-forward $ARGO_SERVER -n argocd 8080:443 &
argocd login localhost:8080 --username admin --password $ARGO_PASSWORD
echo $ARGO_PASSWORD
curl localhost:8080



{"apiVersion":"argoproj.io/v1alpha1","kind":"Application","metadata":{"annotations":{"argocd.argoproj.io/sync-wave":"0"},"labels":{"aws.cdk.eks/prune-c81423afd63c623759fbee9945adc43aaeda9328bd":""},"name":"bootstrap-apps","namespace":"argocd"},"spec":{"destination":{"namespace":"argocd","server":"https://kubernetes.default.svc"},"project":"default","source":{"helm":{"parameters":[{"name":"clusterName","value":"multi-new-eks-mixed-observability-accelerator"},{"name":"region","value":"us-west-2"},{"name":"repoUrl","value":"https://github.com/aws-samples/one-observability-demo.git"},{"name":"targetRevision","value":"main"}],"valueFiles":["values.yaml"]},"path":"grafana-operator-manifests","repoURL":"https://github.com/aws-samples/one-observability-demo.git","targetRevision":"main"},"syncPolicy":{"automated":{"allowEmpty":true,"prune":true,"selfHeal":true}}}}

project: default
source:
  repoURL: 'https://github.com/aws-samples/one-observability-demo.git'
  path: grafana-operator-manifests
  targetRevision: main
  helm:
    valueFiles:
      - values.yaml
    parameters:
      - name: clusterName
        value: multi-new-eks-mixed-observability-accelerator
      - name: region
        value: us-west-2
      - name: repoUrl
        value: 'https://github.com/aws-samples/one-observability-demo.git'
      - name: targetRevision
        value: main
      - name: spec.service.type
        value: LoadBalancer
      - name: spec.ingress.host
        value: teamblueprints.com
destination:
  server: 'https://kubernetes.default.svc'
  namespace: argocd
syncPolicy:
  automated:
    prune: true
    selfHeal: true
    allowEmpty: true
