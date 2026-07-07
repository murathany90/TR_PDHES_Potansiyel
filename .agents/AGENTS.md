# Agent Behavioral Rules

## Workflow Completion Rule
Herhangi bir geliştirme görevi, hata düzeltmesi (bug fix) veya özellik eklemesi tamamlandığında, aşağıdaki adımlar ZORUNLU olarak sırasıyla uygulanmalıdır:
1. **GitHub Push:** Yapılan tüm değişiklikler uygun bir commit mesajıyla GitHub repository'sine push edilmelidir (`git add .`, `git commit -m "..."`, `git push`).
2. **Action/CI Kontrolü:** GitHub tarafında çalışan Actions (CI/CD) süreçlerinin başarılı olup olmadığı kontrol edilmelidir.
3. **Canlı Site Testi:** Değişiklikler deploy edildikten sonra (veya lokalde tüm testler bittikten sonra), canlı sitenin (production) sorunsuz çalıştığı teyit edilmelidir.
4. Bu aşamalar tamamlanmadan kullanıcıya "işlemler bitti" veya "başarıyla uygulandı" mesajı verilmemelidir.
